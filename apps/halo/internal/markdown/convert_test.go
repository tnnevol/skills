package markdown

import (
	"strings"
	"testing"
)

func TestMd2Html_Empty(t *testing.T) {
	if got := Md2Html(""); got != "" {
		t.Fatalf("expected empty string, got: %s", got)
	}
}

func TestMd2Html_Headings(t *testing.T) {
	md := `# H1
## H2
### H3
#### H4
##### H5
###### H6`

	html := Md2Html(md)

	for i := 1; i <= 6; i++ {
		tag := "<h" + string(rune('0'+i))
		closing := "</h" + string(rune('0'+i)) + ">"
		if !strings.Contains(html, tag) {
			t.Fatalf("missing heading tag: %s", tag)
		}
		if !strings.Contains(html, closing) {
			t.Fatalf("missing closing tag: %s", closing)
		}
	}
	if !strings.Contains(html, "H1") {
		t.Fatal("missing H1 content")
	}
	if !strings.Contains(html, "H6") {
		t.Fatal("missing H6 content")
	}
}

func TestMd2Html_Bold(t *testing.T) {
	html := Md2Html("**bold text**")
	if !strings.Contains(html, "<strong>") {
		t.Fatalf("expected <strong> tag, got: %s", html)
	}
	if !strings.Contains(html, "bold text") {
		t.Fatal("missing bold content")
	}
}

func TestMd2Html_Italic(t *testing.T) {
	html := Md2Html("*italic text*")
	if !strings.Contains(html, "<em>") {
		t.Fatalf("expected <em> tag, got: %s", html)
	}
	if !strings.Contains(html, "italic text") {
		t.Fatal("missing italic content")
	}
}

func TestMd2Html_InlineCode(t *testing.T) {
	html := Md2Html("Use `fmt.Println` to print")
	if !strings.Contains(html, "<code>") {
		t.Fatalf("expected <code> tag, got: %s", html)
	}
	if !strings.Contains(html, "fmt.Println") {
		t.Fatal("missing inline code content")
	}
}

func TestMd2Html_CodeBlock(t *testing.T) {
	md := "```go\npackage main\n\nfunc main() {\n\tfmt.Println(\"hello\")\n}\n```"
	html := Md2Html(md)

	if !strings.Contains(html, "<pre") || !strings.Contains(html, "<code") {
		t.Fatalf("expected <pre><code> block, got: %s", html)
	}
	if !strings.Contains(html, "package main") {
		t.Fatal("missing code block content")
	}
}

func TestMd2Html_CodeBlock_EscapesLTGT(t *testing.T) {
	md := "```html\n<div class=\"test\">\n  <p>Hello & World</p>\n</div>\n```"
	html := Md2Html(md)

	if strings.Contains(html, "<div class=") {
		t.Fatal("unescaped HTML in code block")
	}
	if !strings.Contains(html, "&lt;div") {
		t.Fatalf("expected &lt;div in code block, got: %s", html)
	}
}

func TestMd2Html_UnorderedList(t *testing.T) {
	md := `- Item 1
- Item 2
- Item 3`
	html := Md2Html(md)

	if !strings.Contains(html, "<ul>") {
		t.Fatalf("expected <ul> tag, got: %s", html)
	}
	if !strings.Contains(html, "<li>") {
		t.Fatalf("expected <li> tag, got: %s", html)
	}
	if !strings.Contains(html, "Item 1") || !strings.Contains(html, "Item 3") {
		t.Fatal("missing list items")
	}
}

func TestMd2Html_OrderedList(t *testing.T) {
	md := `1. First
2. Second
3. Third`
	html := Md2Html(md)

	if !strings.Contains(html, "<ol>") {
		t.Fatalf("expected <ol> tag, got: %s", html)
	}
	if !strings.Contains(html, "First") || !strings.Contains(html, "Third") {
		t.Fatal("missing ordered list items")
	}
}

func TestMd2Html_NestedList(t *testing.T) {
	md := `- Item 1
  - Sub item A
  - Sub item B
- Item 2`
	html := Md2Html(md)

	if !strings.Contains(html, "<ul>") {
		t.Fatalf("expected <ul> tag, got: %s", html)
	}
	if !strings.Contains(html, "Sub item A") {
		t.Fatal("missing nested list item")
	}
}

func TestMd2Html_Table(t *testing.T) {
	md := `| Name | Age | City |
|------|-----|------|
| Alice | 30 | Beijing |
| Bob | 25 | Shanghai |`
	html := Md2Html(md)

	if !strings.Contains(html, "<table>") {
		t.Fatalf("expected <table> tag, got: %s", html)
	}
	if !strings.Contains(html, "<thead>") {
		t.Fatalf("expected <thead> tag, got: %s", html)
	}
	if !strings.Contains(html, "Alice") || !strings.Contains(html, "Bob") {
		t.Fatal("missing table data")
	}
	if !strings.Contains(html, "Name") {
		t.Fatal("missing table header")
	}
}

func TestMd2Html_Strikethrough(t *testing.T) {
	html := Md2Html("~~deleted~~")
	if !strings.Contains(html, "<del>") {
		t.Fatalf("expected <del> tag for strikethrough, got: %s", html)
	}
	if !strings.Contains(html, "deleted") {
		t.Fatal("missing strikethrough content")
	}
}

func TestMd2Html_Blockquote(t *testing.T) {
	md := `> This is a quote
> with multiple lines`
	html := Md2Html(md)

	if !strings.Contains(html, "<blockquote>") {
		t.Fatalf("expected <blockquote> tag, got: %s", html)
	}
	if !strings.Contains(html, "This is a quote") {
		t.Fatal("missing blockquote content")
	}
}

func TestMd2Html_Link(t *testing.T) {
	html := Md2Html("[Click here](https://example.com)")
	if !strings.Contains(html, "<a") {
		t.Fatalf("expected <a> tag, got: %s", html)
	}
	if !strings.Contains(html, `href="https://example.com"`) {
		t.Fatalf("expected href in link, got: %s", html)
	}
	if !strings.Contains(html, "Click here") {
		t.Fatal("missing link text")
	}
}

func TestMd2Html_HorizontalRule(t *testing.T) {
	html := Md2Html("---")
	if !strings.Contains(html, "<hr") {
		t.Fatalf("expected <hr> tag, got: %s", html)
	}
}

func TestMd2Html_TaskList(t *testing.T) {
	md := `- [ ] Unchecked task
- [x] Checked task`
	html := Md2Html(md)

	if !strings.Contains(html, "input") {
		t.Fatalf("expected <input> for task list, got: %s", html)
	}
	if !strings.Contains(html, `type="checkbox"`) {
		t.Fatalf("expected checkbox input, got: %s", html)
	}
}

func TestMd2Html_MixedContent(t *testing.T) {
	md := "# Hello World\n\nThis is a **bold** paragraph with *italic* text.\n\n- Item with `inline code`\n- [Link](https://example.com)\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n> A great quote\n\n---\n\n~~strikethrough~~ text"

	html := Md2Html(md)

	required := []string{
		"<h1>", "<strong>", "<em>",
		"<ul>", "<li>", "<a", "<code>",
		"<table>", "<blockquote>", "<hr",
	}

	for _, req := range required {
		if !strings.Contains(html, req) {
			t.Fatalf("mixed content missing %s in output:\n%s", req, html)
		}
	}
}
