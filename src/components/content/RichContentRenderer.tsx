import React from "react";

type RichNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>;
  content?: RichNode[];
};

interface RichContentRendererProps {
  content: unknown;
  className?: string;
  emptyText?: string;
}

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const renderTextWithMarks = (
  text: string,
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>,
) => {
  return (marks ?? []).reduce<React.ReactNode>((child, mark, index) => {
    const key = `mark-${index}-${mark.type ?? "unknown"}`;

    switch (mark.type) {
      case "bold":
        return <strong key={key}>{child}</strong>;
      case "italic":
        return <em key={key}>{child}</em>;
      case "underline":
        return <u key={key}>{child}</u>;
      case "strike":
        return <s key={key}>{child}</s>;
      case "textStyle": {
        const color = typeof mark.attrs?.color === "string" ? mark.attrs.color : undefined;
        return (
          <span key={key} style={color ? { color } : undefined}>
            {child}
          </span>
        );
      }
      default:
        return <React.Fragment key={key}>{child}</React.Fragment>;
    }
  }, text);
};

const extractPlainText = (node: unknown): string => {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractPlainText).join(" ").trim();
  if (typeof node === "object") {
    const record = node as Record<string, unknown>;
    return [record.text, record.content]
      .map(extractPlainText)
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  return String(node);
};

const renderNode = (node: RichNode, key: string): React.ReactNode => {
  const children =
    node.content?.map((child, index) => renderNode(child, `${key}-${index}`)) ?? [];

  switch (node.type) {
    case "doc":
      return <React.Fragment key={key}>{children}</React.Fragment>;
    case "paragraph":
      return (
        <p key={key} className="mb-3 leading-6 last:mb-0">
          {children.length > 0 ? children : "\u00a0"}
        </p>
      );
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const Tag = level === 1 ? "h1" : level === 2 ? "h2" : level === 3 ? "h3" : "h4";
      const className =
        level === 1
          ? "mb-3 text-xl font-bold text-text-heading"
          : level === 2
            ? "mb-3 text-lg font-bold text-text-heading"
            : "mb-2 text-base font-semibold text-text-heading";

      return React.createElement(Tag, { key, className }, children);
    }
    case "bulletList":
      return (
        <ul key={key} className="mb-3 list-disc space-y-2 pl-5 last:mb-0">
          {children}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="mb-3 list-decimal space-y-2 pl-5 last:mb-0">
          {children}
        </ol>
      );
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="mb-3 border-l-4 border-primary/30 bg-surface-page px-4 py-3 italic text-text-body"
        >
          {children}
        </blockquote>
      );
    case "hardBreak":
      return <br key={key} />;
    case "text":
      return (
        <React.Fragment key={key}>
          {renderTextWithMarks(node.text ?? "", node.marks)}
        </React.Fragment>
      );
    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "Image";
      if (!src) return null;
      return (
        <img
          key={key}
          src={src}
          alt={alt}
          className="mb-3 max-w-full rounded-[16px] border border-surface-border"
        />
      );
    }
    default: {
      if (children.length > 0) {
        return (
          <div key={key} className="mb-3 last:mb-0">
            {children}
          </div>
        );
      }
      if (node.text) {
        return <React.Fragment key={key}>{node.text}</React.Fragment>;
      }
      return null;
    }
  }
};

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({
  content,
  className,
  emptyText = "Không có nội dung.",
}) => {
  if (!content) {
    return <p className={cx("text-sm text-text-muted", className)}>{emptyText}</p>;
  }

  if (typeof content === "string") {
    return (
      <div className={cx("text-sm leading-6 text-text-body whitespace-pre-wrap", className)}>
        {content}
      </div>
    );
  }

  if (typeof content !== "object") {
    return <p className={cx("text-sm text-text-body", className)}>{String(content)}</p>;
  }

  const root = content as RichNode;
  const rendered = renderNode(root, "root");
  const plainText = extractPlainText(content);

  if (!rendered && !plainText) {
    return <p className={cx("text-sm text-text-muted", className)}>{emptyText}</p>;
  }

  return (
    <div className={cx("text-sm text-text-body", className)}>
      {rendered || <p className="leading-6 whitespace-pre-wrap">{plainText}</p>}
    </div>
  );
};

export default RichContentRenderer;
