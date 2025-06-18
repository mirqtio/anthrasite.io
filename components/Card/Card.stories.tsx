import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'
import { Button } from '../Button/Button'

const meta = {
  title: 'Design System/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'bordered', 'elevated'],
    },
    padding: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    hover: { control: 'boolean' },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold text-anthracite-black mb-2">
          Card Title
        </h3>
        <p className="text-anthracite-black/60">
          This is a default card with some content inside. It can contain any
          React components.
        </p>
      </div>
    ),
  },
}

export const Bordered: Story = {
  args: {
    variant: 'bordered',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-anthracite-black mb-2">
          Bordered Card
        </h3>
        <p className="text-anthracite-black/60">
          This card has a border around it instead of a background color.
        </p>
      </div>
    ),
  },
}

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-anthracite-black mb-2">
          Elevated Card
        </h3>
        <p className="text-anthracite-black/60">
          This card has a shadow to give it an elevated appearance.
        </p>
      </div>
    ),
  },
}

export const Hoverable: Story = {
  args: {
    hover: true,
    children: (
      <div>
        <h3 className="text-lg font-semibold text-anthracite-black mb-2">
          Hoverable Card
        </h3>
        <p className="text-anthracite-black/60">
          Hover over this card to see the interactive hover effect.
        </p>
      </div>
    ),
  },
}

export const Clickable: Story = {
  args: {
    onClick: () => alert('Card clicked!'),
    className: 'cursor-pointer',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-anthracite-black mb-2">
          Clickable Card
        </h3>
        <p className="text-anthracite-black/60">
          Click this card to trigger an action. Notice the cursor changes.
        </p>
      </div>
    ),
  },
}

export const WithButton: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div>
        <h3 className="text-xl font-semibold text-anthracite-black mb-2">
          Premium Plan
        </h3>
        <p className="text-3xl font-bold text-anthracite-black mb-4">$199</p>
        <p className="text-anthracite-black/60 mb-6">
          Get comprehensive website audits with detailed insights and
          recommendations.
        </p>
        <Button fullWidth>Get Started</Button>
      </div>
    ),
  },
}

export const DifferentPadding: Story = {
  render: () => (
    <div className="space-y-4">
      <Card className="p-0">
        <div className="p-4 border-b border-anthracite-gray-100">
          <h4 className="font-semibold">No padding</h4>
        </div>
        <div className="p-4">Content needs its own padding</div>
      </Card>

      <Card padding="sm">
        <h4 className="font-semibold">Small padding</h4>
        <p className="text-sm text-anthracite-black/60">Compact content area</p>
      </Card>

      <Card padding="md">
        <h4 className="font-semibold">Medium padding (default)</h4>
        <p className="text-sm text-anthracite-black/60">
          Standard content area
        </p>
      </Card>

      <Card padding="lg">
        <h4 className="font-semibold">Large padding</h4>
        <p className="text-sm text-anthracite-black/60">
          Spacious content area
        </p>
      </Card>
    </div>
  ),
}
