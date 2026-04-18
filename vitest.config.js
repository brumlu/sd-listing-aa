import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.js'],
    environment: 'node',
    coverage: {
      provider: 'v8', // ou 'istanbul'
      reporter: ['text', 'json', 'html'], // 'html' gera o relatório visual
      reportsDirectory: './coverage', // onde o relatório será salvo
      include: ['usecase/**'], // Foca nos seus Use Cases
      exclude: ['node_modules/', 'infra/**'], // Ignora infraestrutura
    },
  },
});