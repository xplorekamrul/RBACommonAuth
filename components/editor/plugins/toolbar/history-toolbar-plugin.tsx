import { useEffect, useState } from "react"
import { UNDO_COMMAND, REDO_COMMAND, CAN_UNDO_COMMAND, CAN_REDO_COMMAND } from "lexical"
import { Undo, Redo } from "lucide-react"

import { useToolbarContext } from "@/components/editor/context/toolbar-context"
import { Button } from "@/components/ui/button"

export function HistoryToolbar() {
  const { activeEditor } = useToolbarContext()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    return activeEditor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload)
        return false
      },
      1
    )
  }, [activeEditor])

  useEffect(() => {
    return activeEditor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload) 
        return false
      },
      1
    )
  }, [activeEditor])

  const handleUndo = () => {
    activeEditor.dispatchCommand(UNDO_COMMAND, undefined)
  }

  const handleRedo = () => {
    activeEditor.dispatchCommand(REDO_COMMAND, undefined)
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUndo}
        disabled={!canUndo}
        className="h-8 w-8 p-0"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleRedo}
        disabled={!canRedo}
        className="h-8 w-8 p-0"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}
