import React, { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from '../services/anniversaryStorage';
import type {
  Anniversary,
  AnniversaryCategory,
  AnniversaryFormInput,
} from '../types';
import { cn } from '../utils/cn';
import {
  calculateDDay,
  formatKoreanDate,
  getTodayString,
} from '../utils/dateUtils';
import { Button } from './Button';
import { DatePickerCalendar } from './DatePickerCalendar';
import { TextInput } from './TextInput';

interface AnniversaryModalProps {
  isOpen: boolean;
  editingAnniversary: Anniversary | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (input: AnniversaryFormInput, existingId?: string) => void;
  onDelete?: (anniversaryId: string) => void;
}

export const AnniversaryModal: React.FC<AnniversaryModalProps> = ({
  isOpen,
  editingAnniversary,
  defaultDate,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AnniversaryCategory>('birthday');
  const [date, setDate] = useState(defaultDate || getTodayString());
  const [memo, setMemo] = useState('');
  const [repeatAnnually, setRepeatAnnually] = useState(true);
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingAnniversary) {
      setTitle(editingAnniversary.title);
      setCategory(editingAnniversary.category);
      setDate(editingAnniversary.date);
      setMemo(editingAnniversary.memo);
      setRepeatAnnually(editingAnniversary.repeatAnnually);
    } else {
      setTitle('');
      setCategory('birthday');
      setDate(defaultDate || getTodayString());
      setMemo('');
      setRepeatAnnually(true);
    }
    setTitleError(undefined);
    setIsConfirmingDelete(false);
  }, [isOpen, editingAnniversary, defaultDate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCategoryChange = (nextCategory: AnniversaryCategory) => {
    setCategory(nextCategory);
    if (nextCategory === 'birthday') {
      setRepeatAnnually(true);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setTitleError('기념일 이름을 입력해 주세요.');
      return;
    }
    onSave(
      {
        title: title.trim(),
        category,
        date,
        memo: memo.trim(),
        repeatAnnually,
      },
      editingAnniversary?.id
    );
  };

  const dDayPreview = editingAnniversary
    ? calculateDDay({ date, repeatAnnually })
    : calculateDDay({ date, repeatAnnually });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#493B32]/45 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="anniversary-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FFFFFF] border border-[#E9DFD0] shadow-xl p-5 sm:p-7">
        {/* Mobile grab handle */}
        <div
          className="sm:hidden w-10 h-1.5 rounded-full bg-[#E9DFD0] mx-auto mb-3"
          aria-hidden="true"
        />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#8F6849]">
              {editingAnniversary ? '기념일 상세 · 수정' : '새 기념일 추가'}
            </p>
            <h2
              id="anniversary-modal-title"
              className="mt-1 text-xl font-bold text-[#493B32]"
            >
              {editingAnniversary ? editingAnniversary.title : '기념일 등록'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[#6E5C50] hover:bg-[#FAF8F3] hover:text-[#493B32] transition-colors cursor-pointer shrink-0"
            aria-label="닫기"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Live D-Day Preview Summary */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] px-4 py-3 text-xs sm:text-sm">
          <span className="text-[#6E5C50]">
            기준일: {formatKoreanDate(date)}
            {repeatAnnually && dDayPreview.occurrenceDate !== date
              ? ` · 다음 기념일 ${formatKoreanDate(dDayPreview.occurrenceDate)}`
              : ''}
          </span>
          <span className="font-bold text-[#8F6849] tabular-nums">
            {dDayPreview.label}
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
          <TextInput
            id="anniversary-title"
            label="기념일 이름"
            type="text"
            placeholder="예: 친구 생일, 부모님 결혼기념일"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(undefined);
            }}
            error={titleError}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#493B32]">
              기념일 유형
            </span>
            <div
              role="group"
              aria-label="기념일 유형 선택"
              className="flex flex-wrap gap-2"
            >
              {CATEGORY_OPTIONS.map((option) => {
                const isSelected = category === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleCategoryChange(option.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'min-h-[44px] px-4 py-2 rounded-2xl text-sm font-medium transition-colors cursor-pointer border',
                      isSelected
                        ? 'bg-[#8F6849] text-[#FFFFFF] border-[#8F6849]'
                        : 'bg-[#FAF8F3] text-[#493B32] border-[#E9DFD0] hover:border-[#B58C6A]'
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#493B32]">날짜</span>
            <DatePickerCalendar value={date} onChange={setDate} />
          </div>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] px-4 py-3 cursor-pointer min-h-[48px]">
            <div>
              <span className="block text-sm font-medium text-[#493B32]">
                매년 반복되는 기념일
              </span>
              <span className="block text-xs text-[#6E5C50]">
                {CATEGORY_LABELS[category]} 일정을 매년 같은 날짜로 자동 계산합니다.
              </span>
            </div>
            <input
              type="checkbox"
              checked={repeatAnnually}
              onChange={(e) => setRepeatAnnually(e.target.checked)}
              className="h-5 w-5 accent-[#8F6849] rounded cursor-pointer shrink-0"
            />
          </label>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="anniversary-memo"
              className="text-sm font-medium text-[#493B32]"
            >
              메모 <span className="font-normal text-[#6E5C50]">(선택 사항)</span>
            </label>
            <textarea
              id="anniversary-memo"
              rows={3}
              placeholder="케이크 취향이나 미리 준비할 내용을 적어 두세요"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] px-4 py-3 text-base text-[#493B32] placeholder:text-[#6E5C50]/65 transition-colors focus:bg-[#FFFFFF] focus:border-[#B58C6A] focus:outline-none resize-none"
            />
          </div>

          {editingAnniversary && isConfirmingDelete && onDelete && (
            <div
              role="alert"
              className="rounded-2xl border border-[#9F4A3B]/45 bg-[#FAF8F3] p-4 space-y-3"
            >
              <p className="text-sm font-medium text-[#493B32]">
                정말 &ldquo;{editingAnniversary.title}&rdquo; 기념일을 삭제할까요?
              </p>
              <p className="text-xs text-[#6E5C50]">
                삭제된 기념일은 복구할 수 없습니다.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => setIsConfirmingDelete(false)}
                >
                  취소
                </Button>
                <button
                  type="button"
                  onClick={() => onDelete(editingAnniversary.id)}
                  className="flex-1 min-h-[44px] px-4 py-2 rounded-2xl bg-[#9F4A3B] text-[#FFFFFF] text-sm font-medium hover:bg-[#873B2E] transition-colors cursor-pointer"
                >
                  삭제 확인
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {editingAnniversary && onDelete && !isConfirmingDelete ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-2xl text-sm font-medium text-[#9F4A3B] hover:bg-[#FAF8F3] transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>기념일 삭제</span>
              </button>
            ) : (
              <div className="hidden sm:block" />
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 sm:ml-auto">
              <Button variant="outline" size="lg" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" variant="primary" size="lg">
                {editingAnniversary ? '수정 저장' : '기념일 등록'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
