// components/FormField.tsx
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { COLORS } from '../constants/colors';

// Define the props that our component will accept
// We extend TextInputProps to allow passing any standard TextInput prop
interface FormFieldProps extends TextInputProps {
  label: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, ...props }) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#999"
        {...props} // Pass all other props directly to the TextInput
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    backgroundColor: COLORS.white,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.dark,
  },
});

export default FormField;