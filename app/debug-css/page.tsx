export default function DebugCSSPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">CSS Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-white text-black border-2 border-black">
          <p>This should have white background with black text</p>
        </div>
        
        <div className="p-4 bg-anthracite-white text-anthracite-black border-2 border-anthracite-black">
          <p>This uses custom Anthracite colors (white bg, black text)</p>
        </div>
        
        <div className="p-4 bg-anthracite-black text-anthracite-white">
          <p>This has black background with white text</p>
        </div>
        
        <div className="p-4 bg-anthracite-blue text-white">
          <p>This has blue background with white text</p>
        </div>
        
        <div className="p-4" style={{ backgroundColor: 'white', color: 'black', border: '2px solid red' }}>
          <p>This uses inline styles (white bg, black text, red border)</p>
        </div>
        
        <div>
          <p className="text-lg mb-2">CSS Variables Check:</p>
          <div 
            className="p-4 border-2" 
            style={{ 
              backgroundColor: 'var(--color-anthracite-white)', 
              color: 'var(--color-anthracite-black)',
              borderColor: 'var(--color-anthracite-blue)'
            }}
          >
            <p>This uses CSS variables directly</p>
          </div>
        </div>
        
        <div className="mt-8">
          <p className="font-bold">Body Background Check:</p>
          <p>The body element should have a white background.</p>
          <p>If you see a black background, CSS is not loading properly.</p>
        </div>
      </div>
    </div>
  )
}