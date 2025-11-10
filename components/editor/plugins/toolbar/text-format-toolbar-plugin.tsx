import { useCallback, useEffect, useState } from "react"
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, TextNode } from "lexical"

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Subscript, 
  Superscript,
  RemoveFormatting,
} from "lucide-react"

import { useToolbarContext } from "@/components/editor/context/toolbar-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function TextFormatToolbar() {
  const { activeEditor } = useToolbarContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isSubscript, setIsSubscript] = useState(false)
  const [isSuperscript, setIsSuperscript] = useState(false)
  const [isCode, setIsCode] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
      setIsUnderline(selection.hasFormat("underline"))
      setIsStrikethrough(selection.hasFormat("strikethrough"))
      setIsSubscript(selection.hasFormat("subscript"))
      setIsSuperscript(selection.hasFormat("superscript"))
      setIsCode(selection.hasFormat("code"))
    }
  }, [])

  useEffect(() => {
    return activeEditor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [activeEditor, updateToolbar])

  const formatBold = () => {
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
  }

  const formatItalic = () => {
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
  }

  const formatUnderline = () => {
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
  }

  const formatStrikethrough = () => {
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
  }

  const formatCode = () => {
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
  }

  const formatSubscript = () => {
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")
  }

  const formatSuperscript = () => {
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")
  }

  const clearFormatting = () => {
    activeEditor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if (node instanceof TextNode) {
            node.setFormat(0)
            node.setStyle("")
          }
        })
      }
    })
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={isBold ? "secondary" : "ghost"}
        size="sm"
        onClick={formatBold}
        className="h-8 w-8 p-0"
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant={isItalic ? "secondary" : "ghost"}
        size="sm"
        onClick={formatItalic}
        className="h-8 w-8 p-0"
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant={isUnderline ? "secondary" : "ghost"}
        size="sm"
        onClick={formatUnderline}
        className="h-8 w-8 p-0"
        title="Underline (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Button
        variant={isStrikethrough ? "secondary" : "ghost"}
        size="sm"
        onClick={formatStrikethrough}
        className="h-8 w-8 p-0"
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Button
        variant={isCode ? "secondary" : "ghost"}
        size="sm"
        onClick={formatCode}
        className="h-8 w-8 p-0"
        title="Code"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant={isSubscript ? "secondary" : "ghost"}
        size="sm"
        onClick={formatSubscript}
        className="h-8 w-8 p-0"
        title="Subscript"
      >
        <Subscript className="h-4 w-4" />
      </Button>

      <Button
        variant={isSuperscript ? "secondary" : "ghost"}
        size="sm"
        onClick={formatSuperscript}
        className="h-8 w-8 p-0"
        title="Superscript"
      >
        <Superscript className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={clearFormatting}
        className="h-8 w-8 p-0"
        title="Clear Formatting"
      >
        <RemoveFormatting className="h-4 w-4" />
      </Button>
    </div>
  )
}
