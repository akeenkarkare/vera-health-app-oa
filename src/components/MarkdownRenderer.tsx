import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <Markdown style={markdownStyles}>
      {content}
    </Markdown>
  );
};

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: '#2D3748',
  },
  heading1: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: '#1A202C',
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 6,
    color: '#1A202C',
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#2D3748',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 12,
    fontSize: 15,
    lineHeight: 24,
    color: '#2D3748',
  },
  strong: {
    fontWeight: '700',
    color: '#1A202C',
  },
  em: {
    fontStyle: 'italic',
  },
  bullet_list: {
    marginTop: 8,
    marginBottom: 8,
  },
  ordered_list: {
    marginTop: 8,
    marginBottom: 8,
  },
  list_item: {
    marginTop: 4,
    marginBottom: 4,
    flexDirection: 'row',
  },
  bullet_list_icon: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4A5568',
  },
  bullet_list_content: {
    fontSize: 15,
    lineHeight: 24,
    color: '#2D3748',
  },
  code_inline: {
    backgroundColor: '#F7FAFC',
    color: '#D53F8C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
  fence: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  code_block: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    lineHeight: 20,
    color: '#2D3748',
  },
  blockquote: {
    backgroundColor: '#F7FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#4299E1',
    paddingLeft: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  link: {
    color: '#4299E1',
    textDecorationLine: 'underline',
  },
  hr: {
    backgroundColor: '#E2E8F0',
    height: 1,
    marginVertical: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginVertical: 8,
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
  },
  th: {
    flex: 1,
    padding: 8,
    fontWeight: '600',
    backgroundColor: '#F7FAFC',
  },
  td: {
    flex: 1,
    padding: 8,
  },
});
