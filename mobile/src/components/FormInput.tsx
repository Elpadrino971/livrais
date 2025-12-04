import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  required,
  icon,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {icon && `${icon} `}
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor="#999"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && onRightIconPress && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Text style={styles.iconText}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  required: {
    color: '#f44336',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: '#2196F3',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#f44336',
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  rightIcon: {
    padding: 15,
  },
  iconText: {
    fontSize: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 5,
    marginLeft: 5,
  },
});
