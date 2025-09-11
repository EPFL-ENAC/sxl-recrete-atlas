import type { Project } from '@/types/Project'
import JSZip from 'jszip'

async function downloadBundle(
  filteredDataArray: Project[],
  currentLocale: string = 'en',
  isFiltered: boolean = true
) {
  try {
    const zip = new JSZip()

    // 1. Add CSV
    // Define the exact column order as in the original XLS/CSV file
    const predefinedColumnOrder = [
      '_id',
      'description_en',
      'description_fr',
      'name_en',
      'name_fr',
      'main_concrete_type',
      'main_concrete_type_uncertainty',
      'receiver_country',
      'receiver_city',
      'location_uncertainty',
      'distance_km',
      'distance_smaller',
      'start_date_year',
      'date_uncertainty',
      'component_age',
      'age_smaller',
      'age_uncertainty',
      'quantity_reclaimed',
      'quantity_reclaimed_unit',
      'donor_nb_floor',
      'donor_nb_floor_smaller',
      'donor_use',
      'donor_element_type',
      'receiver_nb_floor',
      'receiver_nb_floor_smaller',
      'receiver_nb_floor_larger',
      'receiver_nb_floor_uncertainty',
      'receiver_use',
      'receiver_element_type',
      'element_type_different',
      'reference',
      'impact_design_alternative',
      'impact_difference',
      'impact_source',
      'cost_design_alternative',
      'cost_difference_min_percent',
      'cost_difference_max_percent',
      'cost_source',
      'actors',
      'research_project',
      'unbuilt_with_permission'
    ]

    // Filter columns based on current language and exclude unwanted columns
    const currentLang = currentLocale // 'en' or 'fr'
    const filteredColumnOrder = predefinedColumnOrder.filter((column) => {
      // Remove offset column (random data)
      if (column === 'offset') return false

      // Keep columns that don't have language suffix
      if (!column.endsWith('_en') && !column.endsWith('_fr')) return true

      // Keep only columns matching current language
      return column.endsWith(`_${currentLang}`)
    })

    // Get any additional keys that might exist but aren't in the predefined order
    const allKeys = new Set<string>()
    filteredDataArray.forEach((project) => {
      Object.keys(project).forEach((key) => allKeys.add(key))
    })

    // Combine filtered predefined order with any additional keys (also filtered by language)
    const additionalKeys = Array.from(allKeys)
      .filter((key) => !predefinedColumnOrder.includes(key))
      .filter((key) => {
        // Apply same language filtering to additional keys
        if (key === 'offset') return false
        if (!key.endsWith('_en') && !key.endsWith('_fr')) return true
        return key.endsWith(`_${currentLang}`)
      })
      .sort()
    const finalColumnOrder = [...filteredColumnOrder, ...additionalKeys]

    const csvContent = [
      // header row with predefined order:
      finalColumnOrder.join(','),
      // data rows with consistent column order:
      ...filteredDataArray.map((row: Project) =>
        finalColumnOrder
          .map((key) => {
            const value = (row as Project)[key as keyof Project]
            // Handle undefined/null values and ensure proper CSV escaping
            const cellValue = value !== undefined && value !== null ? String(value) : ''
            return `"${cellValue.replace(/"/g, '""')}"`
          })
          .join(',')
      )
    ].join('\n')

    // Use appropriate filename based on whether data is filtered
    const csvFileName = isFiltered ? 'filtered_data.csv' : 'data.csv'
    zip.file(csvFileName, csvContent)

    // 2. Add README.pdf
    const pdfResponse = await fetch('/README.pdf')
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

async function downloadFilteredData(filteredDataArray: Project[], currentLocale: string = 'en') {
  if (filteredDataArray.length === 0) {
    alert('No data to download')
    return
  }

  try {
    await downloadBundle(filteredDataArray, currentLocale, true) // true = filtered data
  } catch (error) {
    console.error('Error downloading bundle:', error)
    alert('Failed to download the bundle. Please try again.')
  }
}

export { downloadFilteredData, downloadBundle }
