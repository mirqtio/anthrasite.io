export default function VerifyCSSPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">CSS Verification Page</h1>
      
      <div className="space-y-4">
        <p className="text-lg">
          This page tests if CSS is loading correctly. The background should be white.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white border-2 border-black">
            <p className="font-semibold">Standard Colors</p>
            <p>White background, black border</p>
          </div>
          
          <div className="p-4 bg-anthracite-white border-2 border-anthracite-black">
            <p className="font-semibold">Anthracite Colors</p>
            <p>Using custom color variables</p>
          </div>
          
          <div className="p-4 bg-anthracite-blue text-white">
            <p className="font-semibold">Blue Background</p>
            <p>White text on blue</p>
          </div>
          
          <div className="p-4 bg-anthracite-gray-50 border-2 border-anthracite-gray-100">
            <p className="font-semibold">Gray Shades</p>
            <p>Light gray background</p>
          </div>
        </div>
        
        <div className="mt-8 p-4 border-2 border-anthracite-blue rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Debugging Steps:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open Developer Tools (F12)</li>
            <li>Go to the Elements/Inspector tab</li>
            <li>Select the &lt;body&gt; element</li>
            <li>Check the Computed styles panel</li>
            <li>Look for background-color property</li>
            <li>It should show: rgb(255, 255, 255) or white</li>
          </ol>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
          <p className="font-semibold">Note:</p>
          <p>If the background is still black, check the browser console for any CSS loading errors.</p>
        </div>
      </div>
    </div>
  )
}