import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { SearchProgress } from '../components/SearchProgress';
import { StreamService } from '../services/streamService';
import { MarkdownParser, getTagTitle } from '../utils/markdownParser';
import { ContentSection, SearchStep } from '../types';

export const ChatScreen: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [searchSteps, setSearchSteps] = useState<SearchStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const streamService = useRef(new StreamService());
  const markdownParser = useRef(new MarkdownParser());
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new content arrives
    if (sections.length > 0 || searchSteps.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [sections, searchSteps]);

  const handleSubmit = async () => {
    if (!question.trim() || isStreaming) return;

    const trimmedQuestion = question.trim();
    setCurrentQuestion(trimmedQuestion);
    setQuestion('');
    setIsStreaming(true);
    setError(null);
    setSections([]);
    setSearchSteps([]);
    markdownParser.current.reset();

    try {
      await streamService.current.streamQuestion(trimmedQuestion, {
        onChunk: (chunk: string) => {
          const newSections = markdownParser.current.addChunk(chunk);
          setSections([...newSections]);
        },
        onSearchStep: (steps: SearchStep[]) => {
          setSearchSteps([...steps]);
        },
        onError: (err: Error) => {
          setError(err.message);
          setIsStreaming(false);
        },
        onComplete: () => {
          const finalSections = markdownParser.current.finalize();
          setSections([...finalSections]);
          setIsStreaming(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsStreaming(false);
    }
  };

  const handleCancel = () => {
    streamService.current.cancel();
    setIsStreaming(false);
  };

  const renderSection = (section: ContentSection) => {
    if (section.type === 'text') {
      return (
        <View key={section.id} style={styles.textSection}>
          <MarkdownRenderer content={section.content} />
        </View>
      );
    }

    // Render tagged sections as collapsible
    const icon = section.type === 'guideline' ? '📋' : section.type === 'drug' ? '💊' : '📄';
    const title = section.tagName ? getTagTitle(section.tagName) : 'Information';

    return (
      <CollapsibleSection key={section.id} title={title} icon={icon}>
        <MarkdownRenderer content={section.content} />
      </CollapsibleSection>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vera health</Text>
      </View>

      {/* Content Area */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {currentQuestion && (
            <View style={styles.messageContainer}>
              {/* User Question */}
              <CollapsibleSection
                title={currentQuestion}
                defaultExpanded={true}
                icon="❓"
              >
                {/* Search Progress */}
                {searchSteps.length > 0 && (
                  <SearchProgress steps={searchSteps} />
                )}

                {/* Answer Sections */}
                {sections.length > 0 && (
                  <View style={styles.answerContainer}>
                    {sections.map(renderSection)}
                  </View>
                )}

                {/* Streaming Indicator */}
                {isStreaming && sections.length === 0 && searchSteps.length === 0 && (
                  <View style={styles.thinkingContainer}>
                    <ActivityIndicator size="small" color="#4299E1" />
                    <Text style={styles.thinkingText}>Thinking...</Text>
                  </View>
                )}

                {/* Error Message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                  </View>
                )}
              </CollapsibleSection>
            </View>
          )}

          {!currentQuestion && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Ask a clinical question</Text>
              <Text style={styles.emptyStateSubtitle}>
                Get evidence-based answers with guidelines and drug information
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask a clinical question..."
            placeholderTextColor="#A0AEC0"
            value={question}
            onChangeText={setQuestion}
            multiline
            maxLength={500}
            editable={!isStreaming}
            onSubmitEditing={handleSubmit}
          />
          {isStreaming ? (
            <TouchableOpacity
              style={[styles.sendButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.sendButtonText}>⏹</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.sendButton,
                !question.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!question.trim()}
            >
              <Text style={styles.sendButtonText}>▶</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    marginBottom: 16,
  },
  answerContainer: {
    marginTop: 8,
  },
  textSection: {
    marginVertical: 4,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
  },
  thinkingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#718096',
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FC8181',
    marginTop: 8,
  },
  errorText: {
    color: '#C53030',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2D3748',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4299E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  cancelButton: {
    backgroundColor: '#FC8181',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});
