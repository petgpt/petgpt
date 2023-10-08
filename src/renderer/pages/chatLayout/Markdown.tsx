import React, { CSSProperties, FC, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

import rangeParser from 'parse-numeric-range'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css' // `rehype-katex` does not import the CSS for you

type MarkdownProps = {
	markdown: string
}

const Markdown: FC<MarkdownProps> = ({ markdown }) => {
	const syntaxTheme = oneDark

	function CodeCopyBtn({ children }: { children?: ReactNode }) {
		// TODO: 从children里获得code内容
		const [copyOk, setCopyOk] = React.useState(false)
		const iconColor = copyOk ? '#0af20a' : '#ddd'
		const icon = copyOk ? 'fa-check-square' : 'fa-copy'
		const handleClick = () => {
			// navigator.clipboard.writeText(children[0].props.children[0]);
			// console.log(children)
			// setCopyOk(true);
			setTimeout(() => {
				setCopyOk(false)
			}, 500)
			console.log(`click copy`)
		}
		return (
			<div className="absolute right-2 top-2 cursor-pointer text-lg text-white opacity-50 transition-all duration-200 hover:scale-110 hover:opacity-100">
				{/*<i className={`fas ${icon}`} onClick={handleClick} style={{ color: iconColor }}/>*/}
				<svg
					onClick={handleClick}
					style={{ color: iconColor }}
					className="icon"
					viewBox="0 0 1024 1024"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
				>
					<path
						d="M316.8 784h377.6v140.8c0 42.24-34.56 76.8-76.8 76.8h-518.4c-42.24 0-76.8-34.56-76.8-76.8v-518.4c0-42.24 34.56-76.8 76.8-76.8h140.8v377.6c0 42.24 34.56 76.8 76.8 76.8z"
						fill="#ffffff"
						p-id="987"
					></path>
					<path
						d="M1008 105.6v518.4c0 42.24-34.56 76.8-76.8 76.8h-518.4c-42.24 0-76.8-34.56-76.8-76.8v-518.4c0-42.24 34.56-76.8 76.8-76.8h518.4c42.24 0 76.8 34.56 76.8 76.8z"
						fill="#ffffff"
					></path>
				</svg>
			</div>
		)
	}

	const Pre = ({ children }: { children: ReactNode }) => {
		return (
			<pre className="relative mb-12">
				<CodeCopyBtn>{children}</CodeCopyBtn>
				{children}
			</pre>
		)
	}

	const MarkdownComponents: object = {
		pre: Pre,
		code({
			node,
			inline,
			className,
			children,
			...props
		}: {
			node: any
			inline: any
			className: string
			children: string
		}) {
			const hasLang = /language-(\w+)/.exec(className || '')
			const hasMeta = node?.data?.meta

			const applyHighlights: object = (applyHighlights: number) => {
				if (hasMeta) {
					const RE = /{([\d,-]+)}/
					const metadata = node.data.meta?.replace(/\s/g, '')
					// @ts-ignore
					const strlineNumbers = RE?.test(metadata) ? RE?.exec(metadata)[1] : '0'
					const highlightLines = rangeParser(strlineNumbers)
					// @ts-ignore
					const data: string = highlightLines.includes(applyHighlights) ? 'highlight' : null
					return { data }
				} else {
					return {}
				}
			}
			const codeStyle: CSSProperties = {
				margin: 0,
				fontSize: '14px',
				padding: 2,
			}
			return hasLang ? (
				<SyntaxHighlighter
					style={syntaxTheme}
					language={hasLang[1]}
					PreTag="div"
					className="codeStyle scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded"
					showLineNumbers={true}
					wrapLines={hasMeta}
					useInlineStyles={true}
					lineProps={applyHighlights}
					customStyle={codeStyle}
				>
					{String(children).replace(/\n$/, '')}
				</SyntaxHighlighter>
			) : (
				<code className={className} {...props}>
					{children}
				</code>
			)
		},
	}

	const tableStyle: CSSProperties = {}

	const a = () => {
		return <div>11</div>
	}

	return (
		<ReactMarkdown
			components={MarkdownComponents}
			remarkPlugins={[remarkMath, remarkGfm]}
			rehypePlugins={[rehypeKatex]}
			className=""
		>
			{markdown}
		</ReactMarkdown>
	)
}

export default Markdown
