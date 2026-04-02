import React from 'react'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

type BreadcrumbEntry = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbEntry[]
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <Breadcrumb>
    <BreadcrumbList>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={index}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {isLast
                ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )
                : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href!}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
            </BreadcrumbItem>
          </React.Fragment>
        )
      })}
    </BreadcrumbList>
  </Breadcrumb>
)
