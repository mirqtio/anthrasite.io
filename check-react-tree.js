// Simple JavaScript script to check React tree
// This runs after React app initialization to verify the tree is correct

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // Check DOM structure
    const rootElement = document.getElementById('__next')

    if (!rootElement) {
      console.error('❌ No __next root element found')
      return
    }

    const results = {
      bodyChildrenCount: document.body.children.length,
      hasNextDiv: !!document.getElementById('__next'),
      firstChild: document.body.firstElementChild?.tagName,
      bodyClasses: document.body.className,
      scripts: Array.from(document.querySelectorAll('script')).length,
      links: Array.from(document.querySelectorAll('link')).length,
      reactRoot: rootElement.innerHTML.length > 0 ? 'Has content' : 'Empty',
      reactComponents: rootElement.querySelectorAll('[data-reactroot]').length,
    }

    console.log('React Tree Check Results:', results)

    // Log warnings
    if (results.bodyChildrenCount > 5) {
      console.warn('⚠️ Many body children:', results.bodyChildrenCount)
    }

    if (!results.hasNextDiv) {
      console.error('❌ Missing __next div')
    }

    if (results.reactRoot === 'Empty') {
      console.error('❌ React root is empty')
    }

    // Display results on page for visual testing
    if (window.location.search.includes('debug')) {
      const debugDiv = document.createElement('div')
      debugDiv.style.cssText =
        'position:fixed;top:10px;right:10px;background:white;padding:10px;border:1px solid black;font-family:monospace;font-size:12px;z-index:9999;'
      debugDiv.innerHTML = `
        <h4>React Tree Debug</h4>
        <pre>${JSON.stringify(results, null, 2)}</pre>
      `
      document.body.appendChild(debugDiv)
    }
  }, 1000) // Wait for React to mount
})
