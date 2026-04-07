import Header from '../components/Header';

export default function AiChat() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header showBack backTo="/" title="AIに矯正相談" />
      <iframe
        src="https://udify.app/chatbot/9b4JPOsoc7asszK4"
        style={{ flex: 1, width: '100%', minHeight: 700, border: 'none' }}
        allow="microphone"
        title="矯正歯科AIチャット"
      />
    </div>
  );
}
