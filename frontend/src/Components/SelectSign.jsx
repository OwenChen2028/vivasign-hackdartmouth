import { useEffect, useState } from 'react';
import { getSigns } from '../api';
import '../styles/dropdown.css';

export default function SelectSign({ currentSign, onChange, disabled = false }) {
  const [options, setOptions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getSigns()
      .then((signs) => {
        if (cancelled) return;
        setOptions(signs);
        if (signs.length > 0) onChange(signs[0]);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      });

    return () => {
      cancelled = true;
    };
  }, [onChange]);

  function handleChange(event) {
    const selectedSign = options.find((option) => option.signName === event.target.value);
    if (selectedSign) onChange(selectedSign);
  }

  if (error) return <span className="control-error" role="alert">Could not load signs: {error}</span>;

  return (
    <label className="sign-picker">
      <span>Practice sign</span>
      <select
        className="dropdown"
        value={currentSign?.signName || ''}
        onChange={handleChange}
        disabled={disabled || options.length === 0}
      >
        {options.length === 0 && <option value="">Loading…</option>}
        {options.map((option) => (
          <option key={option.signName} value={option.signName}>{option.signName}</option>
        ))}
      </select>
    </label>
  );
}
