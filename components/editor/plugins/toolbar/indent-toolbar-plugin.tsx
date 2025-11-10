import { INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from "lexical"
import { Indent, Outdent } from "lucide-react"

import { useToolbarContext } from "@/components/editor/context/toolbar-context"
import { Button } from "@/components/ui/button"

export function IndentToolbar() {
  const { activeEditor } = useToolbarContext()

  const handleIndent = () => {
    activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
  }

  const handleOutdent = () => {
    activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOutdent}
        className="h-8 w-8 p-0"
        title="Decrease Indent"
      >
        <Outdent className="h-4 w-4" /> 
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleIndent}
        className="h-8 w-8 p-0"
        title="Increase Indent"
      >
        <Indent className="h-4 w-4" />
      </Button>
    </div>
  )
}
