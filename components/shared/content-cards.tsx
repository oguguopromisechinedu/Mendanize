import type { ReactNode } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ContentCardProps = {
  href?: string
  title: string
  description?: string
  meta?: string
  badge?: string
  className?: string
}

function ContentCardShell({
  href,
  className,
  children,
}: {
  href?: string
  className?: string
  children: ReactNode
}) {
  const classes = cn(
    "motion-fade hover:border-primary/30 hover:bg-hover/40",
    className
  )

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className={classes}>{children}</Card>
      </Link>
    )
  }

  return <Card className={classes}>{children}</Card>
}

function ArticleCard(props: ContentCardProps) {
  return (
    <ContentCardShell href={props.href} className={props.className}>
      <CardHeader>
        {props.badge ? <Badge variant="secondary">{props.badge}</Badge> : null}
        <CardTitle>{props.title}</CardTitle>
        {props.description ? (
          <CardDescription>{props.description}</CardDescription>
        ) : null}
      </CardHeader>
      {props.meta ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{props.meta}</p>
        </CardContent>
      ) : null}
    </ContentCardShell>
  )
}

function GuideCard(props: ContentCardProps) {
  return <ArticleCard {...props} badge={props.badge ?? "Guide"} />
}

function ToolCard(props: ContentCardProps) {
  return <ArticleCard {...props} badge={props.badge ?? "AI Tool"} />
}

function CategoryCard(props: ContentCardProps) {
  return <ArticleCard {...props} badge={props.badge ?? "Category"} />
}

function FeatureCard(props: ContentCardProps) {
  return (
    <Card className={cn("bg-surface", props.className)}>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        {props.description ? (
          <CardDescription>{props.description}</CardDescription>
        ) : null}
      </CardHeader>
    </Card>
  )
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <Card className={cn("bg-surface", className)}>
      <CardHeader>
        <p className="type-caption text-muted-foreground">{label}</p>
        <CardTitle className="type-h2">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

export {
  ArticleCard,
  GuideCard,
  ToolCard,
  CategoryCard,
  FeatureCard,
  StatCard,
}
