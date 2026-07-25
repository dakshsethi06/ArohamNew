import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Image, ActivityIndicator
} from 'react-native';
import { Astrologer, Message, ArohamProduct } from '../types';
import { MAROON, GOLD } from '../constants/theme';
import { MOCK_PRODUCTS } from '../services/api';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const STARTER_QUESTIONS = [
  "Which Rudraksha bead is best suited for my Rashi?",
  "Which Gemstone should I wear for career growth?",
  "How do I balance negative planetary influences?"
];

interface ChatRoomScreenProps {
  astrologer: Astrologer;
  onBack: () => void;
  onProductPress?: (p: ArohamProduct) => void;
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({
  astrologer,
  onBack,
  onProductPress
}) => {
  const { user } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize live session on mount
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        // 1. Look for existing session
        const { data: existing } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('astrologer_id', astrologer.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (existing && existing.length > 0) {
          setSession(existing[0]);
          await fetchMessages(existing[0].id);
        } else {
          // 2. Create new session
          const newSessionId = `sess-${Date.now()}`;
          const newSess = {
            id: newSessionId,
            user_id: user.id,
            astrologer_id: astrologer.id,
            status: 'pending',
            topic: 'Vedic Kundali & Horoscope'
          };
          const { error } = await supabase
            .from('chat_sessions')
            .insert(newSess);

          if (!error) {
            setSession(newSess);
          }
        }
      } catch (err) {
        console.warn('Error syncing chat session:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, astrologer.id]);

  // Poll for messages in real-time
  useEffect(() => {
    if (!session?.id) return;

    const interval = setInterval(() => {
      fetchMessages(session.id);
    }, 2000);

    return () => clearInterval(interval);
  }, [session?.id]);

  const fetchMessages = async (sessId: string) => {
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data.map((m: any) => ({
          id: m.id.toString(),
          sender_id: m.sender || m.sender_type,
          text: m.text || m.message_text || '',
          timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommended_product_slug: m.recommended_product_slug
        })));
      }
    } catch (err) {
      console.warn('Error fetching messages:', err);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !session || !user) return;

    const userMsg = {
      session_id: session.id,
      sender: 'user',
      sender_type: 'user',
      text: text,
      message_text: text
    };

    // Pre-insert in local UI for snappy experience
    const tempId = Date.now().toString();
    const tempMsg: Message = {
      id: tempId,
      sender_id: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInputText('');

    try {
      await supabase
        .from('chat_messages')
        .insert(userMsg);
      await fetchMessages(session.id);
    } catch (err) {
      console.warn('Error inserting message:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={MAROON} />
        <Text style={styles.loaderText}>Establishing spiritual corridor…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Close</Text>
        </TouchableOpacity>
        <Image source={{ uri: astrologer.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{astrologer.name}</Text>
          <Text style={styles.headerStatus}>🟢 Live Consultation</Text>
        </View>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView contentContainerStyle={styles.messageScroll} showsVerticalScrollIndicator={false}>
        {messages.length === 0 && (
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeText}>
              Namaste! Say something to begin your astrological guidance.
            </Text>
          </View>
        )}
        
        {messages.map((m) => {
          const isUser = m.sender_id === 'user';
          const recommendedProduct = m.recommended_product_slug
            ? MOCK_PRODUCTS.find(p => p.slug === m.recommended_product_slug)
            : null;

          return (
            <View key={m.id} style={[styles.messageRow, isUser ? styles.userRow : styles.astroRow]}>
              <View style={[styles.bubble, isUser ? styles.userBubble : styles.astroBubble]}>
                <Text style={[styles.messageText, isUser ? styles.userText : styles.astroText]}>
                  {m.text}
                </Text>

                {/* Recommended Product display inside the bubble */}
                {recommendedProduct && (
                  <TouchableOpacity
                    style={styles.recCard}
                    onPress={() => onProductPress?.(recommendedProduct)}
                  >
                    <Image source={{ uri: recommendedProduct.img }} style={styles.recImg} />
                    <View style={styles.recInfo}>
                      <Text style={styles.recName}>{recommendedProduct.name}</Text>
                      <Text style={styles.recPrice}>₹{recommendedProduct.price}</Text>
                      <Text style={styles.recTap}>Tap to view remedy ›</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <Text style={[styles.timestamp, isUser ? styles.userTime : styles.astroTime]}>
                  {m.timestamp}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Quick Questions Chips */}
      <View style={styles.chipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STARTER_QUESTIONS.map((q, idx) => (
            <TouchableOpacity key={idx} style={styles.questionChip} onPress={() => handleSend(q)}>
              <Text style={styles.chipText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Text Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask Pandit ji a question…"
          placeholderTextColor="#8B7355"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend(inputText)}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF7',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCFAF7',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '600',
  },
  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
  },
  backBtn: {
    marginRight: 12,
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
    color: MAROON,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GOLD,
  },
  headerInfo: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3E3125',
  },
  headerStatus: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 2,
  },
  messageScroll: {
    padding: 16,
    paddingBottom: 24,
  },
  welcomeBox: {
    backgroundColor: '#FAF6EF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5D7C3',
    alignItems: 'center',
    marginVertical: 10,
  },
  welcomeText: {
    fontSize: 11,
    color: '#5B4A32',
    fontWeight: '600',
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  astroRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: MAROON,
    borderBottomRightRadius: 4,
  },
  astroBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#FAF3E8',
  },
  messageText: {
    fontSize: 12,
    lineHeight: 18,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  astroText: {
    color: '#3E3125',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 8,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  astroTime: {
    color: '#9a8c7a',
  },
  chipsRow: {
    paddingVertical: 8,
    paddingLeft: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#FAF3E8',
  },
  questionChip: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5B4A32',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#FAF3E8',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 24,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 12,
    color: '#3E3125',
  },
  sendBtn: {
    backgroundColor: MAROON,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '800',
  },
  recCard: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 12,
    padding: 8,
    marginTop: 10,
    gap: 10,
    alignItems: 'center',
  },
  recImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  recInfo: {
    flex: 1,
  },
  recName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3E3125',
  },
  recPrice: {
    fontSize: 10,
    fontWeight: '800',
    color: MAROON,
    marginTop: 2,
  },
  recTap: {
    fontSize: 8,
    fontWeight: '700',
    color: GOLD,
    marginTop: 3,
  },
});
