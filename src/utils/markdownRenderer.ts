import { marked } from 'marked'
import { markedEmoji } from 'marked-emoji'
import type { EmojiToken } from 'marked-emoji'
import { getImageUrl } from './imageUrl'

// Configure marked with emoji support
const emojiOptions = {
  emojis: {
    heart: 'fa-heart',
    tada: 'fa-tada',
    'mdi-plus-box': 'mdi-plus-box',
    'mdi-list-box': 'mdi-list-box',
    'mdi-grid': 'mdi-grid',
    'mdi-map-outline': 'mdi-map-outline',
    'mdi-crane': 'mdi-crane',
    'mdi-email': 'mdi-email',
    'mdi-information': 'mdi-information'
  },
  renderer: (token: EmojiToken) => {
    return `<span class="mdi ${token.emoji}"></span>`
  }
}

marked.use(markedEmoji(emojiOptions))

// Create a custom renderer that handles image URLs
function createImageRenderer() {
  const renderer = new marked.Renderer()
  
  // Handle regular image tags
  const originalImageRenderer = renderer.image
  renderer.image = function(href, title, text) {
    if (href && href.startsWith('/images/')) {
      href = getImageUrl(href)
    }
    return originalImageRenderer.call(this, href, title, text)
  }

  // Handle HTML elements (picture, source with srcset)
  renderer.html = function(html) {
    let transformedHtml = html
    
    // Transform srcset attributes in source and img elements
    transformedHtml = transformedHtml.replace(
      /(<(?:source|img)[^>]*?)srcset="([^"]*?)"/gi,
      (match, elementStart, srcsetValue) => {
        const transformedSrcset = srcsetValue
          .split(',')
          .map((src: string) => {
            const parts = src.trim().split(/\s+/)
            const url = parts[0]
            const descriptor = parts.slice(1).join(' ')
            
            if (url.startsWith('/images/')) {
              const transformedUrl = getImageUrl(url)
              return descriptor ? `${transformedUrl} ${descriptor}` : transformedUrl
            }
            return src.trim()
          })
          .join(', ')
        
        return `${elementStart}srcset="${transformedSrcset}"`
      }
    )
    
    // Transform regular src attributes in img tags within HTML
    transformedHtml = transformedHtml.replace(
      /(<img[^>]*?)src="([^"]*?)"/gi,
      (match, elementStart, srcValue) => {
        if (srcValue.startsWith('/images/')) {
          return `${elementStart}src="${getImageUrl(srcValue)}"`
        }
        return match
      }
    )
    
    return transformedHtml
  }
  
  return renderer
}

/**
 * Parse markdown content with image URL transformation
 */
export function parseMarkdown(content: string): string {
  const renderer = createImageRenderer()
  return marked.parse(content, { 
    headerIds: false, 
    mangle: false, 
    renderer 
  })
}