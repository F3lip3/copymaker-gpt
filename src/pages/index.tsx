import { CircleNotch } from 'phosphor-react';
import { KeyboardEvent, useState } from 'react';
import { OpenAIResponse } from './api/generate';

interface IMessages {
  content: string;
  showRefine: boolean;
}

const Loading = () => {
  return (
    <div className="w-6 h-6 flex items-center justify-center gap-2 overflow-hidden">
      <CircleNotch weight="bold" className="w-4 h-4 animate-spin" />
    </div>
  );
};

export default function Home() {
  const [subject, setSubject] = useState('');
  const [refine, setRefine] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<IMessages[]>([]);
  const [step, setStep] = useState(1);

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === 'Enter' && !e.ctrlKey) {
      await handleSubmit();
    }
  };

  const generateResponse = async (prompt: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt
        })
      });

      const data = (await response.json()) as OpenAIResponse;
      if (data.text)
        setMessages(current => [
          ...current,
          {
            content: data.text ?? '',
            showRefine: false
          }
        ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRefine = () => {
    setMessages(currentMessages =>
      currentMessages.map(msg => ({
        ...msg,
        showRefine: false
      }))
    );
  };

  const handleRefine = async (message: string) => {
    if (refine) {
      await generateResponse(
        `Refine a mensagem abaixo para que ${refine}\n\n${message}`
      );
      setRefine('');
      handleCancelRefine();
    }
  };

  const handleShowRefine = (ix: number) => {
    setMessages(currentMessages =>
      currentMessages.map((msg, index) => ({
        ...msg,
        showRefine: ix === index
      }))
    );
  };

  const handleSubmit = async () => {
    if (subject) {
      await generateResponse(`Escreva uma mensagem sobre ${subject}`);
      setStep(2);
    }
  };

  const contentList = messages.map((message, ix) => (
    <div
      key={`item${ix}`}
      className="flex flex-col bg-gray-800 rounded text-gray-100"
    >
      <pre className="whitespace-pre-wrap p-4">{message.content}</pre>
      <div className="border border-gray-900"></div>
      {message.showRefine ? (
        <div className="flex flex-col gap-2 p-4">
          <label htmlFor={`input-refine-${ix}`} className="text-white text-sm">
            Refine a mensagem para que...
          </label>
          <div className="flex gap-2">
            <input
              id={`input-refine-${ix}`}
              type="text"
              className="w-full h-10 text-md border-none outline-none rounded bg-gray-400 text-gray-900 focus:bg-gray-100 placeholder:text-gray-800 px-3"
              placeholder="Ex.: seja mais agressiva, inclua o valor da mensalidade, inclua uma oferta exclusiva para os primeiros assinantes, etc"
              autoFocus={true}
              value={refine}
              onChange={e => setRefine(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="button"
              className="w-28 h-10 flex items-center justify-center bg-cyan-700 hover:bg-cyan-600 text-white rounded disabled:opacity-50"
              onClick={() => handleRefine(message.content)}
              disabled={!refine || loading}
            >
              {loading ? <Loading /> : 'Enviar'}
            </button>
            <button
              type="button"
              className="w-28 h-10 flex items-center justify-center bg-gray-900 text-gray-100 rounded"
              onClick={handleCancelRefine}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 p-4">
          <button className="w-28 h-8 bg-gray-900 text-white rounded">
            Copiar
          </button>
          <button
            className="w-28 h-8 bg-gray-900 text-white rounded"
            onClick={() => handleShowRefine(ix)}
          >
            Refinar
          </button>
        </div>
      )}
    </div>
  ));

  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="w-3/5 py-8">
        <h1 className="text-3xl font-bold">GPT copymaker</h1>
        <p className="text-lg text-gray-400">
          Eu sou um robô copywriter e posso ajudar você a escrever mensagems de
          todo tipo.
          <br />
          Comece me dizendo qual é o assunto da mensagem...
        </p>
        <div className="flex mt-2 gap-2">
          <input
            type="text"
            className="w-full h-12 text-lg border-none outline-none rounded bg-gray-400 text-gray-900 focus:bg-gray-100 placeholder:text-gray-800 px-3"
            placeholder="Ex.: venda de curso de programação"
            autoFocus={true}
            value={subject}
            onChange={e => setSubject(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={step !== 1}
          />
          <button
            type="button"
            className="w-28 h-12 flex items-center justify-center bg-cyan-700 hover:bg-cyan-600 text-white rounded disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!subject || loading || step !== 1}
          >
            {loading ? <Loading /> : 'Enviar'}
          </button>
        </div>
        <div className="flex flex-col gap-4 py-4">{contentList}</div>
      </div>
    </div>
  );
}
