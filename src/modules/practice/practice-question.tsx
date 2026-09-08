'use client';
import { useState } from 'react';
import { letters, type Letter } from '@/domain/questions';
import type { PracticeItem } from '@/domain/practice';
export function PracticeImage({ url, alt }: { url: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <p role="status">Imagem indisponível: {alt}</p>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className="question-image"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
export function PracticeQuestionCard({
  item,
  disabled,
  onAnswer,
}: {
  item: PracticeItem;
  disabled: boolean;
  onAnswer: (value: Letter) => void;
}) {
  const q = item.question;
  return (
    <div className="question-detail">
      <p className="small muted">
        {q.subject.name} / {q.topic.name} · {q.year} · Fase {q.phase}
      </p>
      <p className="question-statement">{q.statement}</p>
      {q.images.map((m, i) => (
        <PracticeImage key={`${m.url}:${i}`} {...m} />
      ))}
      <fieldset className="practice-alternatives" disabled={disabled}>
        <legend>Selecione sua resposta</legend>
        {letters.map((l) => (
          <button
            type="button"
            aria-pressed={item.selected === l}
            className={`practice-alternative ${item.selected === l ? 'selected' : ''}`}
            key={l}
            onClick={() => onAnswer(l)}
          >
            <strong>{l}</strong>
            <span>{q.alternatives[l]}</span>
          </button>
        ))}
      </fieldset>
      {q.correct_answer && (
        <div className="practice-feedback" role="status">
          <p>
            <strong>
              {item.selected === null
                ? 'Não respondida'
                : item.correct
                  ? 'Resposta correta'
                  : 'Resposta incorreta'}
              . Gabarito: {q.correct_answer}
            </strong>
          </p>
          <p className="question-statement">{q.explanation}</p>
        </div>
      )}
      <p className="small muted">Fonte: {q.source.title}</p>
    </div>
  );
}
