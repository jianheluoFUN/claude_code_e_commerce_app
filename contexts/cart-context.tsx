"use client"

import React, {createContext, useContext, useState, useEffect, useCallback} from 'react'
import {createClient} from '@/lib/supabase/client'
import {
    getLocalCart,
    addToLocalCart,
    updateLocalCartItem,
    removeFromLocalCart,
    clearLocalCart,
    getLocalCartCount,
    mergeLocalCartToDatabase,
    type LocalCartItem
} from '@/lib/cart'
import type {Product} from '@/lib/types'

interface CartItem {
    id: string
    productId: string
    quantity: number
    product?: Product
}

// Here is the interface for shopping cart context data
interface CartContextType {
    items: CartItem[]
    itemCount: number
    isLoading: boolean
    isAuthenticated: boolean

    // the shopping cart context contains following reducer functions:
    //      - addToCart
    //      - updateQuantity
    //      - removeFromCart
    //      - clearCart
    //      - refreshCart
    addToCart: (productId: string, quantity?: number) => Promise<void>
    updateQuantity: (productId: string, quantity: number) => Promise<void>
    removeFromCart: (productId: string) => Promise<void>
    clearCart: () => Promise<void>
    refreshCart: () => Promise<void>
}

// Using the Context API for shopping cart state management
const CartContext = createContext<CartContextType | undefined>(undefined)

// create a provider component for shopping cart context
export function CartProvider(
    {children}: { children: React.ReactNode }
) {


    const [items, setItems] = useState<CartItem[]>([])
    const [itemCount, setItemCount] = useState(0)

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    const [isLoading, setIsLoading] = useState(true)

    const supabase = createClient()

    // Fetch cart items from database (for authenticated users)
    const fetchDatabaseCart = useCallback(
        async (
            profileId: string
        ) => {

            // retrieve from "cart_items" table based on "buyer_id"
            const {
                data
            } = await supabase
                .from('cart_items')
                .select(`
                    id,
                    product_id,
                    quantity,
                    product:products(
                      *,
                      store:stores(id, name, slug)
                    )
                `)
                .eq('buyer_id', profileId)

            if (data) {
                const cartItems: CartItem[] = data.map(item => ({
                    id: item.id,
                    productId: item.product_id,
                    quantity: item.quantity,
                    product: item.product as unknown as Product
                }))

                // update state
                setItems(cartItems)

                // update state
                setItemCount(
                    cartItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                    )
                )
            }
        },
        [supabase]
    )

    // Fetch cart items from localStorage (for guest users)
    const fetchLocalCart = useCallback(
        async () => {

            // By calling "getLocalCart()" function to retrieve cart items from browser local storage
            const localItems = getLocalCart()

            if (localItems.length === 0) {
                setItems([])
                setItemCount(0)
                return
            }

            // Fetch product details for local cart items
            const productIds = localItems.map(item => item.productId)

            // retrieve from "products" table based on product id
            // then populate the store data from "stores" table
            // The query will be run against following tables:
            //      - "products"
            //      - "stores"
            const {
                data: products
            } = await supabase
                .from('products')
                .select(`
                    *,
                    store:stores(id, name, slug)
                  `
                )
                .in('id', productIds)
                .eq('status', 'active')

            if (products) {
                const cartItems: CartItem[] = []

                for (const item of localItems) {
                    const product = products.find(p => p.id === item.productId)
                    if (product) {
                        cartItems.push({
                            id: `local-${item.productId}`,
                            productId: item.productId,
                            quantity: item.quantity,
                            product: product as unknown as Product
                        })
                    }
                }

                setItems(cartItems)
                setItemCount(cartItems.reduce((sum, item) => sum + item.quantity, 0))
            }
        }, [supabase])

    // Initialize cart and auth state
    const initializeCart = useCallback(
        async () => {
            setIsLoading(true)

            const {
                data: {
                    user
                }
            } = await supabase.auth.getUser()

            // In the case that the user already login
            if (user) {
                setIsAuthenticated(true)
                setUserId(user.id)

                // Check if there are local cart items to merge
                const localCart = getLocalCart()

                if (localCart.length > 0) {
                    // In the case that the user already login, we need merge the shopping cart from local storage to the shopping cart in the database
                    await mergeLocalCartToDatabase(
                        supabase,
                        user.id
                    )
                }

                await fetchDatabaseCart(user.id)
            } else {
                // In the case that the user is not login, this is a guest user

                setIsAuthenticated(false)
                setUserId(null)

                // call the "fetchLocalCart()" to fetch shopping cart from local storage
                await fetchLocalCart()
            }

            setIsLoading(false)
        },
        [supabase, fetchDatabaseCart, fetchLocalCart]
    )

    // Listen for auth state changes
    useEffect(() => {

        initializeCart()

        const {
            data: {
                subscription
            }
        } = supabase.auth.onAuthStateChange(
            async (event, session) => {

                if (event === 'SIGNED_IN' && session?.user) {
                    setIsAuthenticated(true)
                    setUserId(session.user.id)

                    // Merge local cart on sign in
                    const localCart = getLocalCart()
                    if (localCart.length > 0) {
                        // since the user login, need to merge the shopping cart from local storage into the database shopping cart
                        await mergeLocalCartToDatabase(supabase, session.user.id)
                    }

                    await fetchDatabaseCart(session.user.id)
                } else if (event === 'SIGNED_OUT') {

                    setIsAuthenticated(false)
                    setUserId(null)
                    setItems([])
                    setItemCount(0)
                }
            })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase, initializeCart, fetchDatabaseCart])


    // Listen for local cart updates (from other tabs or components)
    useEffect(
        () => {

            const handleCartUpdate = () => {
                if (!isAuthenticated) {
                    fetchLocalCart()
                }
            }

            window.addEventListener('cart-updated', handleCartUpdate)
            return () => window.removeEventListener('cart-updated', handleCartUpdate)
        },
        [isAuthenticated, fetchLocalCart]
    )

    const addToCart = async (
        productId: string,
        quantity: number = 1
    ) => {

        if (isAuthenticated && userId) {
            // Database cart
            const {data: existingItem} = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('buyer_id', userId)
                .eq('product_id', productId)
                .single()

            if (existingItem) {
                await supabase
                    .from('cart_items')
                    .update({quantity: existingItem.quantity + quantity})
                    .eq('id', existingItem.id)
            } else {
                await supabase
                    .from('cart_items')
                    .insert({
                        buyer_id: userId,
                        product_id: productId,
                        quantity
                    })
            }

            await fetchDatabaseCart(userId)
        } else {
            // Local cart
            addToLocalCart(productId, quantity)
            await fetchLocalCart()
        }
    }

    const updateQuantity = async (
        productId: string,
        quantity: number
    ) => {
        if (isAuthenticated && userId) {
            if (quantity <= 0) {
                await supabase
                    .from('cart_items')
                    .delete()
                    .eq('buyer_id', userId)
                    .eq('product_id', productId)
            } else {
                await supabase
                    .from('cart_items')
                    .update({quantity})
                    .eq('buyer_id', userId)
                    .eq('product_id', productId)
            }

            await fetchDatabaseCart(userId)
        } else {
            updateLocalCartItem(productId, quantity)
            await fetchLocalCart()
        }
    }

    const removeFromCart = async (
        productId: string
    ) => {
        if (isAuthenticated && userId) {
            await supabase
                .from('cart_items')
                .delete()
                .eq('buyer_id', userId)
                .eq('product_id', productId)

            await fetchDatabaseCart(userId)
        } else {
            removeFromLocalCart(productId)
            await fetchLocalCart()
        }
    }

    const clearCart = async () => {
        if (isAuthenticated && userId) {
            await supabase
                .from('cart_items')
                .delete()
                .eq('buyer_id', userId)

            setItems([])
            setItemCount(0)
        } else {
            clearLocalCart()
            setItems([])
            setItemCount(0)
        }
    }

    const refreshCart = async () => {
        if (isAuthenticated && userId) {
            await fetchDatabaseCart(userId)
        } else {
            await fetchLocalCart()
        }
    }

    return (
        // wrap the children component into the "CartContext.Provider" and passing followings to the "value":
        //      - items
        //      - itemCount
        //      - isLoading
        //      - isAuthenticated
        //
        //      - reducer function:
        //          - addToCart
        //          - updateQuantity
        //          - removeFromCart
        //          - clearCart
        //          - refreshCart
        <CartContext.Provider
            value={{
                items,
                itemCount,
                isLoading,
                isAuthenticated,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                refreshCart
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

// create a custom hook "useCart()", so that within the children components, can use "useCart()" hook to retrieve cart information from global context
export function useCart() {

    const context = useContext(CartContext)

    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
