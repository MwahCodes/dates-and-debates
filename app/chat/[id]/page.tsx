import { ReactElement } from 'react';
import ChatClient from './chat-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: PageProps): Promise<ReactElement> {
  try {
    const { id } = await params;
    return <ChatClient chatPartnerId={id} />;
  } catch (error) {
    console.error('Error loading chat page:', error);
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#F5F5F5]">
        <p className="text-red-500">Failed to load chat. Please try again later.</p>
      </div>
    );
  }
}
