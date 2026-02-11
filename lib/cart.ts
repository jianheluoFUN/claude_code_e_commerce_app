// Cart utilities for localStorage (guest users) and database (authenticated users)

// This is the interface for element in the shopping cart in the local storage
export interface LocalCartItem {
    productId: string
    quantity: number
    addedAt: string
}

const CART_STORAGE_KEY = 'marketplace_cart'

// ============ localStorage Cart Functions ============

// Function to read cart items from local storage
export function getLocalCart(): LocalCartItem[] {

    // Need to ensure that the code is running in the client-side, so that it can access to the local storage in the browser
    if (typeof window === 'undefined') {
        return []
    }

    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY)
        return cart ? JSON.parse(cart) : []
    } catch {
        return []
    }
}

// Function to write cart items into local storage
export function setLocalCart(
    items: LocalCartItem[]
): void {

    // Need to ensure that the code is running in the client-side, so that it can access to the local storage in the browser
    if (typeof window === 'undefined') {
        return
    }

    try {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(items)
        )

        // Dispatch custom event for cart updates
        window.dispatchEvent(
            new CustomEvent('cart-updated')
        )
    } catch (error) {
        console.error('Failed to save cart to localStorage:', error)
    }
}

// Function to add a cart item to shopping cart in the local storage
export function addToLocalCart(
    productId: string,
    quantity: number = 1
): LocalCartItem[] {

    const cart = getLocalCart()

    const existingIndex = cart.findIndex(item => item.productId === productId)

    if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity
    } else {
        cart.push(
            {
                productId,
                quantity,
                addedAt: new Date().toISOString()
            }
        )
    }

    setLocalCart(cart)
    return cart
}

// Function to update cart item quantity in shopping cart in the local storage
export function updateLocalCartItem(
    productId: string,
    quantity: number
): LocalCartItem[] {

    const cart = getLocalCart()

    const existingIndex = cart.findIndex(item => item.productId === productId)

    if (existingIndex >= 0) {
        if (quantity <= 0) {
            cart.splice(existingIndex, 1)
        } else {
            cart[existingIndex].quantity = quantity
        }
    }

    setLocalCart(cart)
    return cart
}

// Function to remove cart item quantity in shopping cart in the local storage
export function removeFromLocalCart(
    productId: string
): LocalCartItem[] {

    const cart = getLocalCart().filter(item => item.productId !== productId)

    setLocalCart(cart)

    return cart
}


export function clearLocalCart(): void {
    if (typeof window === 'undefined') {
        return
    }

    localStorage.removeItem(CART_STORAGE_KEY)

    window.dispatchEvent(new CustomEvent('cart-updated'))
}

export function getLocalCartCount(): number {

    return getLocalCart().reduce(
        (sum, item) => sum + item.quantity,
        0
    )
}

// ============ Cart Merge Function ============

export interface MergeResult {
    success: boolean
    mergedCount: number
    error?: string
}

// function to merge the shopping cart in local storage into the shopping cart in the database
export async function mergeLocalCartToDatabase(
    supabase: any,
    userId: string
): Promise<MergeResult> {

    const localCart = getLocalCart()

    if (localCart.length === 0) {
        return {
            success: true,
            mergedCount: 0
        }
    }

    let mergedCount = 0

    try {
        for (const item of localCart) {
            // Check if item already exists in database cart
            const {data: existingItem} = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('buyer_id', userId)
                .eq('product_id', item.productId)
                .single()

            if (existingItem) {
                // Update quantity (add to existing) into the "cart_items" table
                await supabase
                    .from('cart_items')
                    .update(
                        {
                            quantity: existingItem.quantity + item.quantity
                        }
                    )
                    .eq('id', existingItem.id)
            } else {
                // Insert new item into the "cart_items" table
                await supabase
                    .from('cart_items')
                    .insert(
                        {
                            buyer_id: userId,
                            product_id: item.productId,
                            quantity: item.quantity
                        }
                    )
            }

            mergedCount++
        }

        // Clear local cart after successful merge
        clearLocalCart()

        return {
            success: true,
            mergedCount
        }
    } catch (error) {
        console.error('Failed to merge cart:', error)
        return {
            success: false,
            mergedCount,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}
