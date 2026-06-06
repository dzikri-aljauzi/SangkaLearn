import React from 'react';
import { Plus, Minus, X } from 'lucide-react';

export default function QuestionEditor({ 
    question, 
    index, 
    onChange, 
    onRemove, 
    canRemove = true,
    errors = {} 
}) {
    const updateField = (field, value) => {
        onChange(index, field, value);
    };

    const updateOption = (optIndex, value) => {
        const oldValue = question.options[optIndex];
        const newOptions = [...(question.options || [])];
        newOptions[optIndex] = value;
        updateField('options', newOptions);

        // Update correct_answers if the old value was a correct answer
        const currentCorrect = question.correct_answers || [];
        if (currentCorrect.includes(oldValue)) {
            const newCorrect = currentCorrect.map(ans => ans === oldValue ? value : ans);
            updateField('correct_answers', newCorrect);
        }
    };

    const addOption = () => {
        const newOptions = [...(question.options || []), ''];
        updateField('options', newOptions);
    };

    const removeOption = (optIndex) => {
        if (question.options.length > 2) {
            const optionValue = question.options[optIndex];
            const newOptions = question.options.filter((_, i) => i !== optIndex);
            updateField('options', newOptions);

            // Remove from correct answers if it was selected (support both index and value)
            const newCorrectAnswers = (question.correct_answers || []).filter(
                i => i !== optIndex && i !== optionValue
            );
            updateField('correct_answers', newCorrectAnswers);
        }
    };

    const toggleCorrectAnswer = (optIndex) => {
        const currentCorrect = question.correct_answers || [];
        const optionValue = question.options[optIndex];
        let newCorrect;

        // Support both index-based and value-based correct_answers
        // Check if current correct_answers contains index or value
        const hasIndex = currentCorrect.includes(optIndex);
        const hasValue = currentCorrect.includes(optionValue);

        if (hasIndex || hasValue) {
            // Remove both index and value to be safe
            newCorrect = currentCorrect.filter(i => i !== optIndex && i !== optionValue);
        } else {
            // Add the option value (not index) for consistency with backend
            newCorrect = [...currentCorrect, optionValue];
        }

        updateField('correct_answers', newCorrect);
    };

    const updateTextAnswer = (answerIndex, value) => {
        const newAnswers = [...(question.correct_answers || [''])];
        newAnswers[answerIndex] = value;
        updateField('correct_answers', newAnswers);
    };

    const addTextAnswer = () => {
        const newAnswers = [...(question.correct_answers || []), ''];
        updateField('correct_answers', newAnswers);
    };

    const removeTextAnswer = (answerIndex) => {
        if (question.correct_answers.length > 1) {
            const newAnswers = question.correct_answers.filter((_, i) => i !== answerIndex);
            updateField('correct_answers', newAnswers);
        }
    };

    const renderAnswerSection = () => {
        switch (question.type) {
            case 'multiple_choice':
                return (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Pilihan Jawaban * 
                            <span className="text-sm font-normal text-gray-500 ml-1">
                                (Centang kotak di sebelah kiri untuk menandai jawaban yang benar)
                            </span>
                        </label>
                        {(question.options || []).map((option, optIndex) => {
                            // Support both index-based and value-based correct_answers
                            const correctAnswers = question.correct_answers || [];
                            const isCorrect = correctAnswers.includes(optIndex) || correctAnswers.includes(option);

                            return (
                            <div key={optIndex} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isCorrect}
                                        onChange={() => toggleCorrectAnswer(optIndex)}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        title="Centang jika ini jawaban yang benar"
                                    />
                                    <label className="ml-2 text-xs text-green-600 font-medium">
                                        {isCorrect ? '✓ BENAR' : 'SALAH'}
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(optIndex, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={`Pilihan ${optIndex + 1}...`}
                                    required
                                />
                                {question.options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(optIndex)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        title="Hapus pilihan ini"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            );
                        })}
                        <button
                            type="button"
                            onClick={addOption}
                            className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Pilihan</span>
                        </button>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">
                                <strong>💡 Petunjuk:</strong> Centang kotak di sebelah kiri pilihan untuk menandai jawaban yang benar. 
                                Anda bisa memilih lebih dari satu jawaban benar untuk soal multiple choice.
                            </p>
                        </div>
                    </div>
                );

            case 'true_false':
                return (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Correct Answer *</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name={`question-${index}-answer`}
                                    value="True"
                                    checked={(question.correct_answers || [])[0] === 'True' || (question.correct_answers || [])[0] === 'true'}
                                    onChange={() => updateField('correct_answers', ['True'])}
                                    className="mr-2 text-green-600 focus:ring-green-500"
                                />
                                True
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name={`question-${index}-answer`}
                                    value="False"
                                    checked={(question.correct_answers || [])[0] === 'False' || (question.correct_answers || [])[0] === 'false'}
                                    onChange={() => updateField('correct_answers', ['False'])}
                                    className="mr-2 text-green-600 focus:ring-green-500"
                                />
                                False
                            </label>
                        </div>
                    </div>
                );

            case 'text':
            case 'fill_blank':
                return (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Correct Answers * 
                            <span className="text-sm font-normal text-gray-500 ml-1">
                                (You can add multiple acceptable answers)
                            </span>
                        </label>
                        {(question.correct_answers || ['']).map((answer, answerIndex) => (
                            <div key={answerIndex} className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => updateTextAnswer(answerIndex, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={`Acceptable answer ${answerIndex + 1}...`}
                                    required
                                />
                                {question.correct_answers.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeTextAnswer(answerIndex)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addTextAnswer}
                            className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Alternative Answer</span>
                        </button>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Smart Matching:</strong> Students' answers will be automatically checked against your correct answers. 
                                The system will look for exact matches, partial matches, and keyword matches to give students credit.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
                <h4 className="text-lg font-medium text-gray-900">Question {index + 1}</h4>
                {canRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Remove question"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                    <textarea
                        value={question.question}
                        onChange={(e) => updateField('question', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your question here..."
                        required
                    />
                    {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question Type *</label>
                        <select
                            value={question.type}
                            onChange={(e) => updateField('type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True/False</option>
                            <option value="text">Text Answer</option>
                            <option value="fill_blank">Fill in the Blank</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Points *</label>
                        <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={question.points}
                            onChange={(e) => updateField('points', parseFloat(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {renderAnswerSection()}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation (Optional)
                </label>
                <textarea
                    value={question.explanation || ''}
                    onChange={(e) => updateField('explanation', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain why this is the correct answer (shown to students after quiz)..."
                />
            </div>
        </div>
    );
}