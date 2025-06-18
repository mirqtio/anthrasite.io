export default function TailwindTestPage() {
  return (
    <div className="p-8">
      {/* Testing standard Tailwind classes */}
      <h1 className="text-6xl font-bold mb-4">Text 6xl</h1>
      <h2 className="text-4xl font-semibold mb-4">Text 4xl</h2>
      <h3 className="text-2xl mb-4">Text 2xl</h3>
      <p className="text-xl mb-4">Text xl</p>
      <p className="text-lg mb-4">Text lg</p>
      <p className="text-base mb-4">Text base</p>
      
      {/* Testing colors */}
      <div className="mt-8">
        <p className="text-red-500 mb-2">Red 500</p>
        <p className="text-blue-500 mb-2">Blue 500</p>
        <p className="text-green-500 mb-2">Green 500</p>
      </div>
      
      {/* Testing custom colors */}
      <div className="mt-8">
        <p className="text-anthracite-black mb-2">Anthracite Black</p>
        <p className="text-anthracite-blue mb-2">Anthracite Blue</p>
      </div>
      
      {/* Testing backgrounds */}
      <div className="mt-8">
        <div className="bg-red-500 text-white p-4 mb-2">Red background</div>
        <div className="bg-blue-500 text-white p-4 mb-2">Blue background</div>
        <div className="bg-anthracite-blue text-white p-4 mb-2">Anthracite Blue background</div>
      </div>
      
      {/* Testing spacing */}
      <div className="mt-8 p-8 bg-gray-100">
        <p>Padding 8 and margin-top 8</p>
      </div>
    </div>
  )
}