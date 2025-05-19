import type { Project } from '@/types/Project'
import JSZip from 'jszip'

async function downloadBundle(filteredDataArray: Project[]) {
  try {
    const zip = new JSZip()

    // 1. Add CSV
    const csvContent = [
      // header row:
      Object.keys(filteredDataArray[0]).join(','),
      // data rows:
      ...filteredDataArray.map((row: Project) =>
        Object.values(row)
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n')
    zip.file('filtered_data.csv', csvContent)

    // 2. Add README.pdf
    const pdfResponse = await fetch('/readme_v0.pdf')
    if (!pdfResponse.ok) throw new Error('Couldn’t load README.pdf')
    const pdfBuffer = await pdfResponse.arrayBuffer()
    zip.file('README.pdf', pdfBuffer)

    // 3. Generate and download
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'exported-data.zip'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error creating zip:', error)
    alert('Failed to create the zip file. Please try again.')
  }
}
async function downloadFilteredData(filteredDataArray: Project[]) {
  if (filteredDataArray.length === 0) {
    alert('No data to download')
    return
  }

  try {
    await downloadBundle(filteredDataArray)
  } catch (error) {
    console.error('Error downloading bundle:', error)
    alert('Failed to download the bundle. Please try again.')
  }
}
export { downloadFilteredData }
export default downloadBundle
export { downloadBundle }
