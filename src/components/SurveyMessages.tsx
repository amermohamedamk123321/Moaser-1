import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Message {
  message: string;
  createdAt: string;
  type: 'feedback' | 'suggestion';
}

interface SurveyMessagesProps {
  docKey: string | null;
}

export function SurveyMessages({ docKey }: SurveyMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docKey) {
      setMessages([]);
      return;
    }
    fetchMessages();
  }, [docKey]);

  async function fetchMessages() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('moaser_admin_token');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/surveys/${docKey}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }

  if (!docKey) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Patient Messages</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-gray-500">Loading messages...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && messages.length === 0 && (
          <p className="text-gray-500">No messages for this doctor</p>
        )}

        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-semibold text-gray-600 uppercase">
                  {msg.type === 'feedback' ? 'Feedback' : 'Suggestion'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{msg.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
