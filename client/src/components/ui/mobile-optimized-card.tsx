import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { ChevronRight, MoreHorizontal, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Optimized card for mobile usage with touch-friendly design
interface MobileCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
  iconColor?: string;
  iconBackground?: string;
  href?: string;
  onPress?: () => void;
  badge?: {
    text: string;
    variant: "default" | "destructive" | "outline" | "secondary";
  };
  footer?: ReactNode;
  rightElement?: ReactNode;
  className?: string;
}

export function MobileCard({
  title,
  subtitle,
  description,
  icon,
  iconColor = "text-primary",
  iconBackground = "bg-primary/10",
  href,
  onPress,
  badge,
  footer,
  rightElement,
  className,
}: MobileCardProps) {
  const cardContent = (
    <>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {icon && (
            <div className={cn("p-2 rounded-full flex-shrink-0", iconBackground)}>
              <div className={iconColor}>{icon}</div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{title}</h3>
                {subtitle && (
                  <p className="text-muted-foreground text-xs truncate">{subtitle}</p>
                )}
              </div>
              {badge && (
                <Badge variant={badge.variant} className="ml-2 whitespace-nowrap">
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
            )}
          </div>
          {rightElement ? (
            rightElement
          ) : href ? (
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          ) : null}
        </div>
      </CardContent>
      {footer && <CardFooter className="p-3 pt-0">{footer}</CardFooter>}
    </>
  );

  // Wrap the card with a Link if href is provided
  if (href) {
    return (
      <Card 
        className={cn(
          "overflow-hidden transition-all hover:border-primary/30 active:bg-gray-50 dark:active:bg-gray-800", 
          className
        )}
      >
        <Link href={href} className="block">
          {cardContent}
        </Link>
      </Card>
    );
  }

  // Make it clickable with onPress if provided
  if (onPress) {
    return (
      <Card 
        className={cn(
          "overflow-hidden cursor-pointer transition-all hover:border-primary/30 active:bg-gray-50 dark:active:bg-gray-800", 
          className
        )}
        onClick={onPress}
      >
        {cardContent}
      </Card>
    );
  }

  // Just a regular card
  return (
    <Card className={cn("overflow-hidden", className)}>
      {cardContent}
    </Card>
  );
}

// Social Card for Facebook-style feeds
interface SocialCardProps {
  title: string;
  subtitle?: string;
  content: string;
  icon?: ReactNode;
  image?: string;
  actionUrl?: string;
  actionLabel?: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  className?: string;
}

export function SocialCard({
  title,
  subtitle,
  content,
  icon,
  image,
  actionUrl,
  actionLabel,
  onLike,
  onComment,
  onShare,
  className
}: SocialCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          {icon}
          <div className="flex-1 min-w-0">
            <p className="font-medium">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <p className="text-sm mb-3">{content}</p>
        
        {/* Image if available */}
        {image && (
          <div className="mb-3 -mx-3">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        {/* Action button if provided */}
        {actionUrl && actionLabel && (
          <div className="mt-3">
            <Button 
              asChild
              variant="outline" 
              className="w-full justify-center"
            >
              <Link href={actionUrl}>
                {actionLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
        
        {/* Engagement buttons */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground text-xs font-normal"
            onClick={onLike}
          >
            👍 Like
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground text-xs font-normal"
            onClick={onComment}
          >
            💬 Comment
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground text-xs font-normal"
            onClick={onShare}
          >
            🔗 Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Social feed item specifically for social-media style content
export interface SocialFeedItemProps {
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  timestamp: string;
  content: string;
  image?: string;
  likes?: number;
  comments?: number;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  className?: string;
}

export function SocialFeedItem({
  author,
  timestamp,
  content,
  image,
  likes = 0,
  comments = 0,
  onLike,
  onComment,
  onShare,
  className,
}: SocialFeedItemProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-3">
        {/* Author header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {author.avatar ? (
              <img src={author.avatar} alt={author.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              author.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{author.name}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{author.role || ""}</span>
              {author.role && timestamp && <span className="mx-1">•</span>}
              <span>{timestamp}</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <p className="text-sm mb-3">{content}</p>
        
        {/* Image if available */}
        {image && (
          <div className="mb-3 -mx-3">
            <img 
              src={image} 
              alt="Post" 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        {/* Engagement buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground text-xs font-normal"
            onClick={onLike}
          >
            👍 {likes > 0 ? likes : ""} Like
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground text-xs font-normal"
            onClick={onComment}
          >
            💬 {comments > 0 ? comments : ""} Comment
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground text-xs font-normal"
            onClick={onShare}
          >
            🔗 Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Export MobileCard as MobileOptimizedCard for backward compatibility
export const MobileOptimizedCard = MobileCard;
export const HorizontalCard = MobileCard;
export const CompactCard = MobileCard;