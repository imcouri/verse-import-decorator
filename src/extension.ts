import * as vscode from 'vscode';

// decorates import paths in digest files
class ImportPathDecorator {
    private readonly _decorationType: vscode.TextEditorDecorationType;
    private _activeEditor: vscode.TextEditor | undefined;

    constructor() {
        // decorates import paths
        this._decorationType = vscode.window.createTextEditorDecorationType({
            textDecoration: 'none; display: none', //hide text
            before: {
                contentText: '',
                color: 'var(--vscode-symbolIcon-classForeground)',
                backgroundColor: 'var(--vscode-editor-wordHighlightBackground)',
                border: '1px solid var(--vscode-symbolIcon-classForeground)',
                margin: '0 4px'
            }
        });

        // gets the active editor
        this._activeEditor = vscode.window.activeTextEditor;

        // listens for changes to the active editor
        vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
            this._activeEditor = editor;
            if (editor) {
                this.updateDecorations();
            }
        });

        vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
            if (this._activeEditor && event.document === this._activeEditor.document) {
                this.updateDecorations();
            }
        });

        // init update
        if (this._activeEditor) {
            this.updateDecorations();
        }
    }

    private updateDecorations() {
        if (!this._activeEditor || !this._activeEditor.document.fileName.endsWith('.digest.verse')) {  // should only run on digest files
            return;
        }

        const text = this._activeEditor.document.getText();
        const decorations: vscode.DecorationOptions[] = [];

        // regex to match import paths
        const importPathRegex = /\(\/[^)]+:\)/g;
        let match;

        while ((match = importPathRegex.exec(text))) {
            const fullPath = match[0];
            const startPos = this._activeEditor.document.positionAt(match.index);
            const endPos = this._activeEditor.document.positionAt(match.index + fullPath.length);
            
            // get the last part of the path to display
            const pathParts = fullPath.slice(2, -2).split('/');
            const lastPart = pathParts[pathParts.length - 1].split(':')[0];

            // create the decoration
            const decoration: vscode.DecorationOptions = {
                range: new vscode.Range(startPos, endPos),
                renderOptions: {
                    before: {
                        contentText: `(${lastPart})`,
                        color: 'var(--vscode-symbolIcon-classForeground)',
                        backgroundColor: 'var(--vscode-editor-wordHighlightBackground)',
                        border: '1px solid var(--vscode-symbolIcon-classForeground)',
                        margin: '0 4px'
                    }
                },
                hoverMessage: fullPath
            };

            decorations.push(decoration);
        }

        this._activeEditor.setDecorations(this._decorationType, decorations);
    }

    dispose() {
        this._decorationType.dispose();
    }
}

export function activate(context: vscode.ExtensionContext) {
    const decorator = new ImportPathDecorator();
    context.subscriptions.push(decorator);
}

export function deactivate() {} 