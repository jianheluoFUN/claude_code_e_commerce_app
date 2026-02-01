import Link from "next/link"
import { Flag, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewModerationButton } from "@/components/admin/review-moderation-button"

export default async function ModerationPage() {
  const supabase = await createClient()

  // Fetch flagged reviews
  const { data: flaggedReviews } = await supabase
    .from("reviews")
    .select(`
      *,
      product:products(name, slug),
      buyer:profiles(full_name, email)
    `)
    .eq("status", "flagged")
    .order("created_at", { ascending: false })

  // Fetch all reviews for moderation
  const { data: allReviews } = await supabase
    .from("reviews")
    .select(`
      *,
      product:products(name, slug),
      buyer:profiles(full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  const ReviewCard = ({ review }: { review: any }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href={`/products/${review.product?.slug}`}
                className="font-medium hover:text-primary"
              >
                {review.product?.name}
              </Link>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <Badge
                variant={
                  review.status === "visible"
                    ? "default"
                    : review.status === "flagged"
                    ? "warning"
                    : "secondary"
                }
              >
                {review.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              By {review.buyer?.full_name || "Anonymous"} ({review.buyer?.email}) on{" "}
              {new Date(review.created_at).toLocaleDateString()}
            </p>
            {review.comment && (
              <p className="text-sm">{review.comment}</p>
            )}
          </div>
          <ReviewModerationButton
            reviewId={review.id}
            currentStatus={review.status}
          />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground">Review and moderate user content</p>
      </div>

      <Tabs defaultValue="flagged">
        <TabsList>
          <TabsTrigger value="flagged">
            Flagged ({flaggedReviews?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="mt-6 space-y-4">
          {flaggedReviews && flaggedReviews.length > 0 ? (
            flaggedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No flagged content to review.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6 space-y-4">
          {allReviews && allReviews.length > 0 ? (
            allReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No reviews yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
