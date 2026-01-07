import React from "react";
import { TOPIC_KEYS } from "./ModalQuiz";

export default function TopicFilter({ value, onChange }) {
  return (
    <select
      className="border p-2"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">Tất cả chủ đề</option>
      {TOPIC_KEYS.map(t => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );
}
