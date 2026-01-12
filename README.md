# LLM Chat Application

Современное веб-приложение для общения с языковыми моделями через OpenRouter API, построенное на Next.js 16 и React 19.

## 🚀 Возможности

- 💬 Чат с различными LLM моделями через OpenRouter API
- 📝 История чатов с автосохранением в localStorage
- 🎨 Современный и отзывчивый UI с Tailwind CSS
- ⚡ Оптимизированная производительность с React.memo
- 🔒 Типобезопасность с TypeScript
- 📱 Адаптивный дизайн

## 📋 Требования

- Node.js 18+ 
- npm, yarn, pnpm или bun

## 🛠️ Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd llm-chat
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env.local` в корне проекта:
```env
NEXT_PUBLIC_OPENROUTER_API_KEY=your_api_key_here
NEXT_PUBLIC_OPENROUTER_MODEL=openai/gpt-4
```

   **Как получить API ключ:**
   - Зарегистрируйтесь на [OpenRouter.ai](https://openrouter.ai/)
   - Перейдите в [настройки ключей](https://openrouter.ai/keys)
   - Создайте новый API ключ
   - Скопируйте ключ в `.env.local`

   **Доступные модели:**
   - `openai/gpt-4` - GPT-4
   - `anthropic/claude-3-opus` - Claude 3 Opus
   - `meta-llama/llama-3-70b-instruct` - Llama 3
   - И другие модели на [OpenRouter](https://openrouter.ai/models)

4. Запустите сервер разработки:
```bash
npm run dev
```

5. Откройте [http://localhost:3000](http://localhost:3000) в браузере

## 📁 Структура проекта

```
llm-chat/
├── app/                    # Next.js App Router страницы
│   ├── page.tsx           # Главная страница
│   ├── chat/              # Страница чата
│   └── layout.tsx         # Корневой layout
├── components/            # React компоненты
│   ├── dialog-box/       # Компоненты чата
│   ├── main-area/        # Основная область
│   ├── side-bar/         # Боковая панель
│   └── ui/               # UI компоненты
├── hooks/                # React хуки
│   ├── useChat.ts        # Основной хук для чата
│   ├── useChatMessages.ts # Управление сообщениями
│   └── useChatSender.ts  # Отправка сообщений
├── lib/                  # Утилиты и сервисы
│   └── ai-service.ts     # Интеграция с OpenRouter API
├── types/                # TypeScript типы
├── utils/                # Вспомогательные функции
│   ├── storage/          # Работа с localStorage
│   └── messageFactory.ts # Фабрика сообщений
└── public/               # Статические файлы
```

## 🎯 Основные компоненты

### Хуки

- **`useChat`** - Главный хук для управления чатом
- **`useChatMessages`** - Управление сообщениями и их загрузкой
- **`useChatSender`** - Отправка сообщений в AI

### Сервисы

- **`StorageService`** - Работа с localStorage для сохранения чатов
- **`MessageFactory`** - Создание объектов сообщений
- **`sendToAI`** - Отправка запросов в OpenRouter API

## 🔧 Скрипты

- `npm run dev` - Запуск dev сервера
- `npm run build` - Сборка production версии
- `npm run start` - Запуск production сервера
- `npm run lint` - Проверка кода линтером

## 🐛 Обработка ошибок

Приложение включает улучшенную обработку ошибок:
- Валидация переменных окружения при запуске
- Информативные сообщения об ошибках для пользователя
- Обработка таймаутов (30 секунд)
- Обработка сетевых ошибок

## 📝 Недавние улучшения

- ✅ Исправлена опечатка в `ai-service.ts` (controller)
- ✅ Улучшена типизация (убраны `any[]`)
- ✅ Удален неиспользуемый хук `useMessageSender`
- ✅ Добавлена валидация переменных окружения
- ✅ Оптимизирована производительность (React.memo)
- ✅ Улучшен UX (адаптивные стили, подтверждение удаления)
- ✅ Улучшена обработка ошибок

## 🚧 Рекомендации для дальнейшего развития

1. **Безопасность**: Перенести API ключ на серверную сторону (API routes)
2. **Тестирование**: Добавить unit и integration тесты
3. **Streaming**: Реализовать streaming ответов от AI
4. **История контекста**: Сохранять контекст разговора для лучших ответов
5. **Экспорт чатов**: Добавить возможность экспорта чатов
6. **Темная тема**: Реализовать переключение темы
7. **Поиск**: Добавить поиск по истории чатов

## 📄 Лицензия

MIT

## 🤝 Вклад

Приветствуются pull requests и issues!

---

Создано с ❤️ используя Next.js и React
