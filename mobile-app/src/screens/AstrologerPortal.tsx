import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import { MAROON, GOLD } from '../constants/theme';
import { MOCK_PRODUCTS } from '../services/api';

export const AstrologerPortal: React.FC = () => {
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([
    { id: '1', sender: 'seeker', text: 'Pranam Babaji. Which gemstone should I wear for career growth?', time: '12:05 PM' }
  ]);
  const [inputText, setInputText] = useState('');

  const chatsQueue = [
    { id: '1', name: 'Rajesh Kumar', topic: 'Career & Wealth', time: '12:05 PM' },
    { id: '2', name: 'Anjali Sharma', topic: 'Kundali Matching', time: '12:10 PM' }
  ];

  const handleSend = (text: string, recProduct: any = null) => {
    if (!text.trim() && !recProduct) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: 'astro',
      text: text || `I recommend wearing this: ${recProduct.name}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      product: recProduct
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  if (activeChat) {
    return (
      <View style={styles.container}>
        {/* Chat Room Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setActiveChat(null)} style={styles.backBtn}>
            <Text style={styles.backText}>← Inbox</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{activeChat.name}</Text>
            <Text style={styles.headerSub}>{activeChat.topic}</Text>
          </View>
        </View>

        {/* Messages List */}
        <ScrollView style={styles.messageScroll}>
          {messages.map((m) => {
            const isAstro = m.sender === 'astro';
            return (
              <View key={m.id} style={[styles.msgRow, isAstro ? styles.astroRow : styles.seekerRow]}>
                <View style={[styles.bubble, isAstro ? styles.astroBubble : styles.seekerBubble]}>
                  <Text style={isAstro ? styles.astroText : styles.seekerText}>{m.text}</Text>
                  {m.product && (
                    <View style={styles.recItem}>
                      <Image source={{ uri: m.product.img }} style={styles.recImg} />
                      <Text style={styles.recName}>{m.product.name}</Text>
                    </View>
                  )}
                  <Text style={styles.time}>{m.time}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Remedy Prescription Tray */}
        <View style={styles.prescriptionTray}>
          <Text style={styles.trayTitle}>Prescribe Remedy:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MOCK_PRODUCTS.slice(0, 4).map((p) => (
              <TouchableOpacity key={p.id} style={styles.presBtn} onPress={() => handleSend('', p)}>
                <Text style={styles.presText}>💎 {p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input box */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type your spiritual advice…"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend(inputText)}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Astrologer Info Summary */}
      <View style={styles.astroHero}>
        <Text style={styles.astroTitle}>Scholar Dashboard</Text>
        <Text style={styles.astroName}>Pandit Raghav Sharma</Text>
        <Text style={styles.astroRole}>Senior Jyotish Consultant</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>₹4,850</Text>
          <Text style={styles.statLabel}>Today's Earnings</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>32 chats</Text>
          <Text style={styles.statLabel}>Monthly Chats</Text>
        </View>
      </View>

      {/* Active consultation queues */}
      <View style={styles.section}>
        <Text style={styles.secTitle}>Active Chat Requests</Text>
        {chatsQueue.map((chat) => (
          <TouchableOpacity key={chat.id} style={styles.chatCard} onPress={() => setActiveChat(chat)}>
            <View style={styles.chatInfo}>
              <Text style={styles.chatSeeker}>{chat.name}</Text>
              <Text style={styles.chatTopic}>Topic: {chat.topic}</Text>
            </View>
            <View style={styles.chatAction}>
              <Text style={styles.chatTime}>{chat.time}</Text>
              <Text style={styles.acceptBtnText}>ACCEPT ›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF7',
  },
  header: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF3E8',
    gap: 16,
  },
  backBtn: {
    paddingVertical: 6,
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
    color: MAROON,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3E3125',
  },
  headerSub: {
    fontSize: 9,
    color: '#8B7355',
    fontWeight: '600',
    marginTop: 2,
  },
  astroHero: {
    backgroundColor: MAROON,
    paddingVertical: 24,
    alignItems: 'center',
  },
  astroTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 1,
  },
  astroName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
  },
  astroRole: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: MAROON,
  },
  statLabel: {
    fontSize: 10,
    color: '#8B7355',
    fontWeight: '700',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
  },
  secTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3E3125',
    marginBottom: 12,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(200, 160, 68, 0.12)',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatInfo: {
    gap: 4,
  },
  chatSeeker: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3E3125',
  },
  chatTopic: {
    fontSize: 10,
    color: '#8B7355',
  },
  chatAction: {
    alignItems: 'flex-end',
    gap: 6,
  },
  chatTime: {
    fontSize: 9,
    color: '#9a8c7a',
    fontWeight: '600',
  },
  acceptBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: MAROON,
  },
  messageScroll: {
    flex: 1,
    padding: 16,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  astroRow: {
    justifyContent: 'flex-end',
  },
  seekerRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  astroBubble: {
    backgroundColor: MAROON,
    borderBottomRightRadius: 4,
  },
  seekerBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FAF3E8',
    borderBottomLeftRadius: 4,
  },
  astroText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  seekerText: {
    color: '#3E3125',
    fontSize: 12,
  },
  time: {
    fontSize: 8,
    color: 'rgba(0,0,0,0.3)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  prescriptionTray: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#FAF3E8',
    padding: 12,
  },
  trayTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B7355',
    marginBottom: 8,
  },
  presBtn: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5D7C3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  presText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5B4A32',
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#FAF3E8',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#FAF8F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5D7C3',
    paddingHorizontal: 16,
    fontSize: 12,
  },
  sendBtn: {
    backgroundColor: MAROON,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '800',
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 6,
    marginTop: 6,
    gap: 8,
  },
  recImg: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  recName: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
