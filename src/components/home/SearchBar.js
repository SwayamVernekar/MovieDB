import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { Colors } from '../../theme/colors';

export default function SearchBar({ onSearch, onFocus }) {
  const [value, setValue] = useState('');

  const handleChange = (text) => {
    setValue(text);
    if (onSearch) onSearch(text);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search movies, series..."
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={handleChange}
          onFocus={onFocus}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => handleChange('')} activeOpacity={0.7}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchIcon: {
    fontSize: 15,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '400',
  },
  clearIcon: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    padding: 2,
  },
});
