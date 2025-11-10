import { useCallback, useEffect, useState } from "react"
import { $getSelection, $isRangeSelection, FORMAT_ELEMENT_COMMAND, $isElementNode } from "lexical"
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"

import { useToolbarContext } from "@/components/editor/context/toolbar-context"
import { Button } from "@/components/ui/button"

type ElementFormatType = "left" | "center" | "right" | "justify"

export function AlignmentToolbar() {
    const { activeEditor } = useToolbarContext()
    const [elementFormat, setElementFormat] = useState<ElementFormatType>("left")

    const updateToolbar = useCallback(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode()
            const element =
                anchorNode.getKey() === "root"
                    ? anchorNode
                    : anchorNode.getTopLevelElementOrThrow()
            const elementDOM = activeEditor.getElementByKey(element.getKey())
            if (elementDOM !== null && $isElementNode(element)) {
                const format = element.getFormat()
                // Format is a number, convert to string
                if (format === 1) setElementFormat("left")
                else if (format === 2) setElementFormat("center")
                else if (format === 3) setElementFormat("right")
                else if (format === 4) setElementFormat("justify")
                else setElementFormat("left")
            }
        }
    }, [activeEditor])

    useEffect(() => {
        return activeEditor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar()
            })
        })
    }, [activeEditor, updateToolbar]) 

    const formatAlign = (format: ElementFormatType) => {
        activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format)
    }

    return (
        <div className="flex items-center gap-1">
            <Button
                variant={elementFormat === "left" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => formatAlign("left")}
                className="h-8 w-8 p-0"
                title="Align Left"
            >
                <AlignLeft className="h-4 w-4" />
            </Button>

            <Button
                variant={elementFormat === "center" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => formatAlign("center")}
                className="h-8 w-8 p-0"
                title="Align Center"
            >
                <AlignCenter className="h-4 w-4" />
            </Button>

            <Button
                variant={elementFormat === "right" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => formatAlign("right")}
                className="h-8 w-8 p-0"
                title="Align Right"
            >
                <AlignRight className="h-4 w-4" />
            </Button>

            <Button
                variant={elementFormat === "justify" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => formatAlign("justify")}
                className="h-8 w-8 p-0"
                title="Justify"
            >
                <AlignJustify className="h-4 w-4" />
            </Button>
        </div>
    )
}
