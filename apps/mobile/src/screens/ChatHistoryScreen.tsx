import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MAROON, GOLD } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

interface ChatHistoryScreenProps {
  onBack: () => void;
}

export const ChatHistoryScreen: React.FC<ChatHistoryScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase.from('chat_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setSessions(data || []);
      setLoading(false);
    })();
  }, [user?.id]);

  const viewSession = async (sess: any) => {
    setSelected(sess);
    setLoadingTranscript(true);
    const { data } = await supabase.from('chat_messages').select('*').eq('session_id', sess.id).order('created_at', { ascending: true });
    setTranscript(
      (data || [])
        .filter((m: any) => (m.text || m.message_text) !== 'Namaste! Astrologer will join your chat soon.')
        .map((m: any) => ({
          id: m.id,
          sender: m.sender || m.sender_type,
          text: m.text || m.message_text,
          timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }))
    );
    setLoadingTranscript(false);
  };

  if (selected) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}><Text style={styles.backText}>← All Sessions</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Consultation Transcript</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          {loadingTranscript ? (
            <ActivityIndicator size="large" color={MAROON} style={{ marginTop: 30 }} />
          ) : transcript.length === 0 ? (
            <Text style={styles.emptyText}>No messages were exchanged in this session.</Text>
          ) : (
            transcript.map((m) => (
              <View key={m.id} style={[styles.messageRow, m.sender === 'user' ? styles.userRow : styles.astroRow]}>
                <View style={[styles.bubble, m.sender === 'user' ? styles.userBubble : styles.astroBubble]}>
                  <Text style={[styles.messageText, m.sender === 'user' && styles.userText]}>{m.text}</Text>
                  <Text style={[styles.timestamp, m.sender === 'user' && styles.userTimestamp]}>{m.timestamp}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>My Saved Chat History</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading && <ActivityIndicator size="large" color={MAROON} style={{ marginTop: 30 }} />}
        {!loading && sessions.length === 0 && (
          <Text style={styles.emptyText}>No previous consultations yet. Start a chat with a scholar to see it here.</Text>
        )}
        {sessions.map((s) => (
          <TouchableOpacity key={s.id} style={styles.sessionCard} onPress={() => viewSession(s)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionTopic}>{s.topic || 'Vedic Consultation'}</Text>
              <Text style={styles.sessionDate}>{new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
            </View>
            <Text style={[styles.sessionStatus, s.status === 'completed' && styles.sessionStatusDone]}>{s.status || 'pending'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFAF7' },
  header: {
    height: 56, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#FAF3E8', gap: 12,
  },
  backBtn: { paddingVertical: 6 },
  backText: { fontSize: 12, fontWeight: '700', color: MAROON },
  headerTitle: { fontSize: 14, fontWeight: '800', color: '#3E3125' },
  scroll: { padding: 16, gap: 10 },
  emptyText: { fontSize: 12, color: '#8B7355', textAlign: 'center', marginTop: 30 },
  sessionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: 'rgba(200,160,68,0.12)', marginBottom: 10,
  },
  sessionTopic: { fontSize: 12, fontWeight: '800', color: '#3E3125' },
  sessionDate: { fontSize: 10, color: '#9a8c7a', marginTop: 3 },
  sessionStatus: {
    fontSize: 9, fontWeight: '800', color: '#8B6914', backgroundColor: 'rgba(200,160,68,0.12)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, textTransform: 'uppercase',
  },
  sessionStatusDone: { color: '#2E6B2E', backgroundColor: 'rgba(74,138,74,0.12)' },
  messageRow: { flexDirection: 'row', marginBottom: 12 },
  userRow: { justifyContent: 'flex-end' },
  astroRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: MAROON },
  astroBubble: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FAF3E8' },
  messageText: { fontSize: 12, color: '#3E3125' },
  userText: { color: '#FFFFFF' },
  timestamp: { fontSize: 8, color: '#9a8c7a', marginTop: 4, alignSelf: 'flex-end' },
  userTimestamp: { color: 'rgba(255,255,255,0.6)' },
});
