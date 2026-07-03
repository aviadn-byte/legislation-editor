import { useLegislation } from './hooks/useLegislation'
import { DocHeader } from './components/DocHeader'
import { BlockList } from './components/BlockList'
import { AddBlockBar } from './components/AddBlockBar'
import { ValidationBanner } from './components/ValidationBanner'
import { exportToDocx, downloadDocx } from './export/docxExport'

function App() {
  const { doc, numbers, errors, dispatch } = useLegislation()

  const hasErrors = errors.some((e) => e.severity === 'error')

  function jumpToBlock(blockId: string) {
    const el = document.querySelector(`[data-block-id="${blockId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function handleExport() {
    const blob = await exportToDocx(doc)
    downloadDocx(blob, `${doc.title || 'מסמך'}.docx`)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col">
      <DocHeader
        doc={doc}
        exportDisabled={hasErrors}
        onMetaChange={(changes) => dispatch({ type: 'SET_META', changes })}
        onNewDoc={(docType) => dispatch({ type: 'NEW_DOC', docType })}
        onExport={handleExport}
        onLoadDoc={(loadedDoc) => dispatch({ type: 'LOAD_DOC', doc: loadedDoc })}
      />

      <ValidationBanner errors={errors} onJump={jumpToBlock} />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <AddBlockBar
          lastBlock={doc.blocks[doc.blocks.length - 1]}
          onAdd={(blockType) => dispatch({ type: 'ADD_BLOCK', blockType })}
        />

        <BlockList
          blocks={doc.blocks}
          numbers={numbers}
          errors={errors}
          onChange={(id, changes) => dispatch({ type: 'UPDATE_BLOCK', id, changes })}
          onDelete={(id) => dispatch({ type: 'DELETE_BLOCK', id })}
          onMove={(id, direction) => dispatch({ type: 'MOVE_BLOCK', id, direction })}
        />
      </div>
    </div>
  )
}

export default App
