import React, { useState, useEffect } from 'react';
import { Plus, X, MoveUp, MoveDown, Image as ImageIcon, Type, Trash2, Eye } from 'lucide-react';

/**
 * ContentBuilder Component
 * A drag-and-drop style content builder for creating lessons with text and images
 * Features live preview and flexible block ordering
 */
export default function ContentBuilder({ value = [], onChange, disabled = false }) {
    const [blocks, setBlocks] = useState(value || []);
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        if (value && JSON.stringify(value) !== JSON.stringify(blocks)) {
            setBlocks(value || []);
        }
    }, [value]);

    useEffect(() => {
        if (onChange && !disabled) {
            onChange(blocks);
        }
    }, [blocks]);

    const addTextBlock = () => {
        const newBlock = {
            id: Date.now().toString(),
            type: 'text',
            content: '',
            order: blocks.length
        };
        setBlocks([...blocks, newBlock]);
    };

    const addImageBlock = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Convert to base64 for preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newBlock = {
                        id: Date.now().toString(),
                        type: 'image',
                        file: file,
                        preview: reader.result,
                        caption: '',
                        order: blocks.length
                    };
                    setBlocks([...blocks, newBlock]);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const updateBlock = (id, updates) => {
        setBlocks(blocks.map(block =>
            block.id === id ? { ...block, ...updates } : block
        ));
    };

    const removeBlock = (id) => {
        setBlocks(blocks.filter(block => block.id !== id).map((block, index) => ({
            ...block,
            order: index
        })));
    };

    const moveBlock = (id, direction) => {
        const index = blocks.findIndex(block => block.id === id);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === blocks.length - 1)
        ) {
            return;
        }

        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

        // Update order
        const reorderedBlocks = newBlocks.map((block, idx) => ({
            ...block,
            order: idx
        }));

        setBlocks(reorderedBlocks);
    };

    const renderBlock = (block, index) => {
        if (block.type === 'text') {
            return (
                <div key={block.id} className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Type className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-700">Text Block</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => moveBlock(block.id, 'up')}
                                disabled={disabled || index === 0}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <MoveUp className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveBlock(block.id, 'down')}
                                disabled={disabled || index === blocks.length - 1}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <MoveDown className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => removeBlock(block.id)}
                                disabled={disabled}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        disabled={disabled}
                        placeholder="Tulis konten text di sini..."
                        className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                </div>
            );
        }

        if (block.type === 'image') {
            return (
                <div key={block.id} className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-gray-700">Image Block</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => moveBlock(block.id, 'up')}
                                disabled={disabled || index === 0}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <MoveUp className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveBlock(block.id, 'down')}
                                disabled={disabled || index === blocks.length - 1}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <MoveDown className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => removeBlock(block.id)}
                                disabled={disabled}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                            {block.preview || block.url ? (
                                <img
                                    src={block.preview || block.url}
                                    alt={block.caption || 'Image preview'}
                                    className="w-full h-auto max-h-96 object-contain"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-48 bg-gray-100">
                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            value={block.caption || ''}
                            onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                            disabled={disabled}
                            placeholder="Caption gambar (opsional)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>
            );
        }

        return null;
    };

    const renderPreview = () => {
        return (
            <div className="bg-white rounded-xl border-2 border-blue-200 p-6 max-h-[600px] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Preview Mode</h3>
                    <button
                        type="button"
                        onClick={() => setPreviewMode(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="prose prose-lg max-w-none">
                    {blocks.length === 0 ? (
                        <p className="text-gray-400 text-center py-12">Belum ada konten untuk ditampilkan</p>
                    ) : (
                        blocks.map((block) => {
                            if (block.type === 'text') {
                                return (
                                    <div key={block.id} className="mb-6">
                                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                            {block.content || <span className="text-gray-400 italic">Text block kosong</span>}
                                        </p>
                                    </div>
                                );
                            }
                            if (block.type === 'image') {
                                return (
                                    <div key={block.id} className="mb-6">
                                        <div className="rounded-xl overflow-hidden shadow-md">
                                            {block.preview || block.url ? (
                                                <img
                                                    src={block.preview || block.url}
                                                    alt={block.caption || 'Content image'}
                                                    className="w-full h-auto"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-48 bg-gray-100">
                                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        {block.caption && (
                                            <p className="text-sm text-gray-600 text-center mt-2 italic">
                                                {block.caption}
                                            </p>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })
                    )}
                </div>
            </div>
        );
    };

    if (previewMode) {
        return renderPreview();
    }

    return (
        <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
                <button
                    type="button"
                    onClick={addTextBlock}
                    disabled={disabled}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Type className="w-4 h-4" />
                    Tambah Text
                </button>
                <button
                    type="button"
                    onClick={addImageBlock}
                    disabled={disabled}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ImageIcon className="w-4 h-4" />
                    Tambah Gambar
                </button>
                {blocks.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setPreviewMode(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors ml-auto"
                    >
                        <Eye className="w-4 h-4" />
                        Live Preview
                    </button>
                )}
            </div>

            {/* Content Blocks */}
            <div className="space-y-3">
                {blocks.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                            <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Mulai Membuat Konten
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Klik tombol "Tambah Text" atau "Tambah Gambar" di atas untuk mulai membuat konten pembelajaran
                        </p>
                    </div>
                ) : (
                    blocks.map((block, index) => renderBlock(block, index))
                )}
            </div>

            {/* Info Footer */}
            {blocks.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-blue-700">{blocks.length}</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-900">
                                {blocks.length} block konten
                            </p>
                            <p className="text-xs text-blue-700 mt-0.5">
                                Gunakan tombol panah untuk mengubah urutan block
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
