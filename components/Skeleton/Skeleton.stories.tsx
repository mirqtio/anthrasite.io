import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './Skeleton'
import { Card } from '../Card/Card'

const meta = {
  title: 'Design System/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {
  args: {
    className: 'h-4 w-[200px]',
  },
}

export const Circular: Story = {
  args: {
    className: 'h-[60px] w-[60px] rounded-full',
  },
}

export const Rectangular: Story = {
  args: {
    className: 'h-[200px] w-[300px]',
  },
}

export const TextParagraph: Story = {
  render: () => (
    <div className="space-y-2" style={{ width: '400px' }}>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  ),
}

export const CardSkeleton: Story = {
  render: () => (
    <Card variant="bordered" style={{ width: '350px' }}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/5" />
        </div>
      </div>
    </Card>
  ),
}

export const ProductSkeleton: Story = {
  render: () => (
    <div style={{ width: '300px' }}>
      <Skeleton className="mb-4 h-[300px] w-full" />
      <Skeleton className="mb-2 h-6 w-4/5" />
      <Skeleton className="mb-4 h-5 w-2/5" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>
  ),
}

export const TableSkeleton: Story = {
  render: () => (
    <div className="space-y-2" style={{ width: '600px' }}>
      <div className="flex gap-4">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
      <div className="h-px bg-anthracite-gray-100" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      ))}
    </div>
  ),
}