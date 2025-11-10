import { $createCodeNode } from "@lexical/code"
import { $setBlocksType } from "@lexical/selection"
import { $createParagraphNode, $getSelection, $isRangeSelection } from "lexical"

import { useToolbarContext } from "@/components/editor/context/toolbar-context"
import { blockTypeToBlockName } from "@/components/editor/plugins/toolbar/block-format/block-format-data"
import { SelectItem } from "@/components/ui/select"

const BLOCK_FORMAT_VALUE = "code"

export function FormatCodeBlock() {
  const { activeEditor, blockType } = useToolbarContext()

  const formatParagraph = () => {
    activeEditor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }
 
  const formatCodeBlock = () => {
    if (blockType !== "code") {
      activeEditor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createCodeNode())
        }
      })
    } else {
      formatParagraph()
    }
  }

  return (
    <SelectItem value={BLOCK_FORMAT_VALUE} onPointerDown={formatCodeBlock}>
      <div className="flex items-center gap-1 font-normal">
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.icon || "{ }"}
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.label || "Code Block"}
      </div>
    </SelectItem>
  )
}
