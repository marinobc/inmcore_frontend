import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import { router } from './core/router';
import 'flowbite';
import i18n from '@/core/locales/i18n';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia).use(router).use(i18n).mount('#app');
