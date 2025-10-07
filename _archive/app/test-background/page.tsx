export default function TestBackgroundPage() {
  return (
    <div
      style={{
        backgroundColor: 'white',
        color: 'black',
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      <h1 style={{ color: 'black' }}>Background Test Page</h1>
      <p>
        If you see this text on a white background, inline styles are working.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <p>Tailwind classes test:</p>
        <div className="bg-white text-black p-4 border-2 border-black">
          This should have white background with black text and black border
          (using Tailwind)
        </div>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <p>Check body computed styles in DevTools:</p>
        <ul>
          <li>Right-click anywhere on page → Inspect</li>
          <li>Select the &lt;body&gt; element</li>
          <li>Check Computed styles for background-color</li>
        </ul>
      </div>
    </div>
  )
}
