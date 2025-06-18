import type { Meta, StoryObj } from '@storybook/react'
import { colors, typography, spacing, animation, shadows } from '@/lib/design-system/tokens'

const meta = {
  title: 'Design System/Design Tokens',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const ColorSwatch = ({ color, name }: { color: string; name: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className="w-24 h-24 rounded-lg border border-anthracite-gray-100"
      style={{ backgroundColor: color }}
    />
    <div className="text-center">
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-anthracite-black/60">{color}</p>
    </div>
  </div>
)

export const Colors: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Primary Colors</h3>
        <div className="flex gap-4 flex-wrap">
          <ColorSwatch color={colors.anthracite.black} name="Black" />
          <ColorSwatch color={colors.anthracite.white} name="White" />
          <ColorSwatch color={colors.anthracite.blue} name="Blue" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Gray Scale</h3>
        <div className="flex gap-4 flex-wrap">
          <ColorSwatch color={colors.anthracite.gray[50]} name="Gray 50" />
          <ColorSwatch color={colors.anthracite.gray[100]} name="Gray 100" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Semantic Colors</h3>
        <div className="flex gap-4 flex-wrap">
          <ColorSwatch color={colors.anthracite.error} name="Error" />
        </div>
      </div>
    </div>
  ),
}

export const Typography: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Font Sizes</h3>
        <div className="space-y-4">
          {Object.entries(typography.fontSize).map(([key, value]) => (
            <div key={key} className="flex items-baseline gap-4">
              <span className="text-sm text-anthracite-black/60 w-20">{key}</span>
              <span style={{ fontSize: value }}>{value} - The quick brown fox</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Font Weights</h3>
        <div className="space-y-4">
          {Object.entries(typography.fontWeight).map(([key, value]) => (
            <div key={key} className="flex items-baseline gap-4">
              <span className="text-sm text-anthracite-black/60 w-20">{key}</span>
              <span style={{ fontWeight: value }}>Weight {value} - The quick brown fox</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Line Heights</h3>
        <div className="space-y-4">
          {Object.entries(typography.lineHeight).map(([key, value]) => (
            <div key={key} className="flex items-start gap-4">
              <span className="text-sm text-anthracite-black/60 w-20">{key}</span>
              <p style={{ lineHeight: value, maxWidth: '400px' }}>
                {value} - The quick brown fox jumps over the lazy dog. This is a longer sentence to demonstrate line height.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

export const Spacing: Story = {
  render: () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold mb-4">Spacing Scale</h3>
      <div className="space-y-4">
        {Object.entries(spacing).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <span className="text-sm text-anthracite-black/60 w-20">{key}</span>
            <div className="flex items-center gap-2">
              <div
                className="bg-anthracite-blue"
                style={{ width: value, height: '32px' }}
              />
              <span className="text-sm">{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
}

export const Shadows: Story = {
  render: () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold mb-4">Shadow Variants</h3>
      <div className="grid grid-cols-2 gap-8">
        {Object.entries(shadows).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <p className="text-sm font-medium">{key}</p>
            <div
              className="bg-white p-8 rounded-lg border border-anthracite-gray-100"
              style={{ boxShadow: value }}
            >
              <p className="text-sm text-anthracite-black/60">Shadow example</p>
            </div>
            <p className="text-xs text-anthracite-black/40 font-mono">{value}</p>
          </div>
        ))}
      </div>
    </div>
  ),
}

export const Animations: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Animation Durations</h3>
        <div className="space-y-4">
          {Object.entries(animation.duration).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <span className="text-sm text-anthracite-black/60 w-20">{key}</span>
              <span className="text-sm">{value}</span>
              <button
                className="px-4 py-2 bg-anthracite-blue text-white rounded-lg"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.transition = `transform ${value}`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                Hover me
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Animation Easings</h3>
        <div className="space-y-4">
          {Object.entries(animation.easing).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <span className="text-sm text-anthracite-black/60 w-20">{key}</span>
              <span className="text-xs font-mono text-anthracite-black/40">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}