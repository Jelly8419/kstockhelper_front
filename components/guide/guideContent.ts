/**
 * Page-local body copy for the guide page.
 *
 * This is NOT i18n key management — it is a self-contained translation data
 * file scoped to the guide page. Values are populated for 9 locales; `ur` is
 * intentionally omitted and falls back to English via `getGuideContent`.
 */

import type { SupportedLocale } from "@/lib/i18n/config";

export type GuideContent = {
  page: { title: string; subtitle: string };
  step1: {
    title: string;
    description: string;
    commonTrust: { title: string; description: string };
    commonDeposit: { title: string; description: string };
    binanceButton: string;
    bybitButton: string;
    notice: { supportedRegions: string; newAccountRequired: string };
  };
  step2: {
    title: string;
    description: string;
    binanceUidLabel: string;
    bybitUidLabel: string;
    submitButton: string;
    binanceHelp1: string;
    binanceHelp2: string;
    bybitHelp1: string;
    bybitHelp2: string;
    notice: {
      sameDayApproval: string;
      premium30Days: string;
      monthlyTradingRequired: string;
      returnToBasic: string;
    };
  };
  step3: {
    title: string;
    benefitNews: { title: string; description: string };
    benefitMarketData: { title: string; description: string };
    benefitComingSoon: { title: string; description: string };
  };
  bottom: { notice: { uidRequired: string } };
};

const GUIDE_CONTENT: Partial<Record<SupportedLocale, GuideContent>> = {
  en: {
    page: {
      title: "Start Trading & Get Premium",
      subtitle:
        "Create an account on your preferred exchange, connect your UID, and get Premium access.",
    },
    step1: {
      title: "Create an Account on Your Preferred Exchange",
      description: "Choose an exchange and sign up using our referral link.",
      commonTrust: {
        title: "Trusted & Secure",
        description: "Both exchanges are globally trusted and secure.",
      },
      commonDeposit: {
        title: "Deposit & Start Trading",
        description: "Deposit funds and start trading right away.",
      },
      binanceButton: "Sign Up on Binance",
      bybitButton: "Sign Up on Bybit",
      notice: {
        supportedRegions:
          "Only eligible users in supported regions can sign up through our links.",
        newAccountRequired:
          "To get Premium access, you must create a new account through our referral link. Existing accounts are not eligible for Premium access.",
      },
    },
    step2: {
      title: "Connect Your UID & Apply for Premium",
      description: "Enter your UID from the exchange and submit your application.",
      binanceUidLabel: "Binance UID",
      bybitUidLabel: "Bybit UID",
      submitButton: "Submit & Apply",
      binanceHelp1: "Go to Binance App → Profile → ID",
      binanceHelp2: "Copy the UID numbers only.",
      bybitHelp1: "Go to Bybit App → Profile → UID",
      bybitHelp2: "Copy the UID numbers only.",
      notice: {
        sameDayApproval:
          "UID applications are usually approved on the same day.",
        premium30Days:
          "Once your UID is approved, your account gets 30 days of Premium access.",
        monthlyTradingRequired:
          "Monthly trading activity is required to keep Premium.",
        returnToBasic:
          "If monthly trading activity is not confirmed, your account will return to Basic.",
      },
    },
    step3: {
      title: "Premium Benefits",
      benefitNews: {
        title: "Hot in Korea & Korean Market News",
        description:
          "Get full access to key summaries of Hot in Korea news, Korean stock news, and disclosures.",
      },
      benefitMarketData: {
        title: "Korean Market Data",
        description: "Access Korean market data built for global investors.",
      },
      benefitComingSoon: {
        title: "More Premium Features Coming Soon",
        description:
          "We are continuously building more Premium tools for Korean market investors.",
      },
    },
    bottom: {
      notice: {
        uidRequired:
          "UID approval is required to activate Premium access. You will be notified by email and in-app once your UID is approved.",
      },
    },
  },
  vi: {
    page: {
      title: "Bắt đầu giao dịch & nhận Premium",
      subtitle:
        "Tạo tài khoản trên sàn bạn chọn, kết nối UID và nhận quyền truy cập Premium.",
    },
    step1: {
      title: "Tạo tài khoản trên sàn bạn chọn",
      description: "Chọn một sàn và đăng ký bằng liên kết giới thiệu của chúng tôi.",
      commonTrust: {
        title: "Đáng tin cậy & bảo mật",
        description:
          "Cả hai sàn đều được tin cậy trên toàn cầu và có độ bảo mật cao.",
      },
      commonDeposit: {
        title: "Nạp tiền & bắt đầu giao dịch",
        description: "Nạp tiền và bắt đầu giao dịch ngay.",
      },
      binanceButton: "Đăng ký trên Binance",
      bybitButton: "Đăng ký trên Bybit",
      notice: {
        supportedRegions:
          "Chỉ người dùng đủ điều kiện tại các khu vực được hỗ trợ mới có thể đăng ký qua liên kết của chúng tôi.",
        newAccountRequired:
          "Để nhận quyền truy cập Premium, bạn phải tạo tài khoản mới qua liên kết giới thiệu của chúng tôi. Tài khoản hiện có không đủ điều kiện nhận Premium.",
      },
    },
    step2: {
      title: "Kết nối UID & đăng ký Premium",
      description: "Nhập UID từ sàn và gửi đơn đăng ký của bạn.",
      binanceUidLabel: "Binance UID",
      bybitUidLabel: "Bybit UID",
      submitButton: "Gửi & đăng ký",
      binanceHelp1: "Mở ứng dụng Binance → Hồ sơ → ID",
      binanceHelp2: "Chỉ sao chép số UID.",
      bybitHelp1: "Mở ứng dụng Bybit → Hồ sơ → UID",
      bybitHelp2: "Chỉ sao chép số UID.",
      notice: {
        sameDayApproval:
          "Đơn UID thường được phê duyệt trong cùng ngày.",
        premium30Days:
          "Sau khi UID được phê duyệt, tài khoản của bạn sẽ có 30 ngày truy cập Premium.",
        monthlyTradingRequired:
          "Cần có hoạt động giao dịch hằng tháng để duy trì Premium.",
        returnToBasic:
          "Nếu không xác nhận được hoạt động giao dịch hằng tháng, tài khoản của bạn sẽ trở về Basic.",
      },
    },
    step3: {
      title: "Lợi ích Premium",
      benefitNews: {
        title: "Hot in Korea & Tin tức thị trường Hàn Quốc",
        description:
          "Nhận toàn quyền truy cập vào các bản tóm tắt chính của Hot in Korea, tin tức chứng khoán Hàn Quốc và công bố doanh nghiệp.",
      },
      benefitMarketData: {
        title: "Dữ liệu thị trường Hàn Quốc",
        description:
          "Truy cập dữ liệu thị trường Hàn Quốc dành cho nhà đầu tư toàn cầu.",
      },
      benefitComingSoon: {
        title: "Sắp có thêm tính năng Premium",
        description:
          "Chúng tôi đang tiếp tục xây dựng thêm công cụ Premium cho nhà đầu tư thị trường Hàn Quốc.",
      },
    },
    bottom: {
      notice: {
        uidRequired:
          "Cần phê duyệt UID để kích hoạt quyền truy cập Premium. Bạn sẽ được thông báo qua email và trong ứng dụng sau khi UID được phê duyệt.",
      },
    },
  },
  "pt-BR": {
    page: {
      title: "Comece a operar e obtenha Premium",
      subtitle:
        "Crie uma conta na corretora de sua preferência, conecte seu UID e obtenha acesso Premium.",
    },
    step1: {
      title: "Crie uma conta na corretora de sua preferência",
      description: "Escolha uma corretora e cadastre-se usando nosso link de indicação.",
      commonTrust: {
        title: "Confiável e segura",
        description:
          "Ambas as corretoras são reconhecidas globalmente como confiáveis e seguras.",
      },
      commonDeposit: {
        title: "Deposite e comece a operar",
        description: "Deposite fundos e comece a operar imediatamente.",
      },
      binanceButton: "Cadastre-se na Binance",
      bybitButton: "Cadastre-se na Bybit",
      notice: {
        supportedRegions:
          "Apenas usuários elegíveis em regiões atendidas podem se cadastrar por meio dos nossos links.",
        newAccountRequired:
          "Para obter acesso Premium, você deve criar uma nova conta usando nosso link de indicação. Contas existentes não são elegíveis para acesso Premium.",
      },
    },
    step2: {
      title: "Conecte seu UID e solicite Premium",
      description: "Insira seu UID da corretora e envie sua solicitação.",
      binanceUidLabel: "UID da Binance",
      bybitUidLabel: "UID da Bybit",
      submitButton: "Enviar e solicitar",
      binanceHelp1: "Abra o app da Binance → Perfil → ID",
      binanceHelp2: "Copie apenas os números do UID.",
      bybitHelp1: "Abra o app da Bybit → Perfil → UID",
      bybitHelp2: "Copie apenas os números do UID.",
      notice: {
        sameDayApproval:
          "As solicitações de UID geralmente são aprovadas no mesmo dia.",
        premium30Days:
          "Após a aprovação do seu UID, sua conta recebe 30 dias de acesso Premium.",
        monthlyTradingRequired:
          "É necessário ter atividade de negociação mensal para manter o Premium.",
        returnToBasic:
          "Se a atividade de negociação mensal não for confirmada, sua conta voltará para Basic.",
      },
    },
    step3: {
      title: "Benefícios Premium",
      benefitNews: {
        title: "Hot in Korea e notícias do mercado coreano",
        description:
          "Tenha acesso completo aos principais resumos do Hot in Korea, notícias de ações coreanas e divulgações corporativas.",
      },
      benefitMarketData: {
        title: "Dados do mercado coreano",
        description:
          "Acesse dados do mercado coreano criados para investidores globais.",
      },
      benefitComingSoon: {
        title: "Mais recursos Premium em breve",
        description:
          "Estamos desenvolvendo continuamente mais ferramentas Premium para investidores do mercado coreano.",
      },
    },
    bottom: {
      notice: {
        uidRequired:
          "A aprovação do UID é necessária para ativar o acesso Premium. Você será notificado por email e no app assim que seu UID for aprovado.",
      },
    },
  },
  es: {
    page: {
      title: "Comienza a operar y obtén Premium",
      subtitle:
        "Crea una cuenta en el exchange que prefieras, conecta tu UID y obtén acceso Premium.",
    },
    step1: {
      title: "Crea una cuenta en el exchange que prefieras",
      description: "Elige un exchange y regístrate usando nuestro enlace de referido.",
      commonTrust: {
        title: "Confiable y seguro",
        description:
          "Ambos exchanges son reconocidos globalmente como confiables y seguros.",
      },
      commonDeposit: {
        title: "Deposita y comienza a operar",
        description: "Deposita fondos y comienza a operar de inmediato.",
      },
      binanceButton: "Regístrate en Binance",
      bybitButton: "Regístrate en Bybit",
      notice: {
        supportedRegions:
          "Solo los usuarios elegibles en regiones admitidas pueden registrarse a través de nuestros enlaces.",
        newAccountRequired:
          "Para obtener acceso Premium, debes crear una cuenta nueva a través de nuestro enlace de referido. Las cuentas existentes no son elegibles para acceso Premium.",
      },
    },
    step2: {
      title: "Conecta tu UID y solicita Premium",
      description: "Ingresa tu UID del exchange y envía tu solicitud.",
      binanceUidLabel: "UID de Binance",
      bybitUidLabel: "UID de Bybit",
      submitButton: "Enviar y solicitar",
      binanceHelp1: "Abre la app de Binance → Perfil → ID",
      binanceHelp2: "Copia solo los números del UID.",
      bybitHelp1: "Abre la app de Bybit → Perfil → UID",
      bybitHelp2: "Copia solo los números del UID.",
      notice: {
        sameDayApproval:
          "Las solicitudes de UID suelen aprobarse el mismo día.",
        premium30Days:
          "Una vez aprobado tu UID, tu cuenta obtiene 30 días de acceso Premium.",
        monthlyTradingRequired:
          "Se requiere actividad de trading mensual para mantener Premium.",
        returnToBasic:
          "Si no se confirma actividad de trading mensual, tu cuenta volverá a Basic.",
      },
    },
    step3: {
      title: "Beneficios Premium",
      benefitNews: {
        title: "Hot in Korea y noticias del mercado coreano",
        description:
          "Obtén acceso completo a resúmenes clave de Hot in Korea, noticias de acciones coreanas y divulgaciones corporativas.",
      },
      benefitMarketData: {
        title: "Datos del mercado coreano",
        description:
          "Accede a datos del mercado coreano creados para inversores globales.",
      },
      benefitComingSoon: {
        title: "Más funciones Premium próximamente",
        description:
          "Seguimos desarrollando más herramientas Premium para inversores del mercado coreano.",
      },
    },
    bottom: {
      notice: {
        uidRequired:
          "La aprobación del UID es necesaria para activar el acceso Premium. Recibirás una notificación por email y dentro de la app cuando tu UID sea aprobado.",
      },
    },
  },
  id: {
    page: {
      title: "Mulai Trading & Dapatkan Premium",
      subtitle:
        "Buat akun di exchange pilihan Anda, hubungkan UID, dan dapatkan akses Premium.",
    },
    step1: {
      title: "Buat akun di exchange pilihan Anda",
      description: "Pilih exchange dan daftar menggunakan tautan referral kami.",
      commonTrust: {
        title: "Tepercaya & aman",
        description: "Kedua exchange dipercaya secara global dan aman digunakan.",
      },
      commonDeposit: {
        title: "Deposit & mulai trading",
        description: "Deposit dana dan mulai trading segera.",
      },
      binanceButton: "Daftar di Binance",
      bybitButton: "Daftar di Bybit",
      notice: {
        supportedRegions:
          "Hanya pengguna yang memenuhi syarat di wilayah yang didukung yang dapat mendaftar melalui tautan kami.",
        newAccountRequired:
          "Untuk mendapatkan akses Premium, Anda harus membuat akun baru melalui tautan referral kami. Akun yang sudah ada tidak memenuhi syarat untuk akses Premium.",
      },
    },
    step2: {
      title: "Hubungkan UID & ajukan Premium",
      description: "Masukkan UID dari exchange dan kirim pengajuan Anda.",
      binanceUidLabel: "UID Binance",
      bybitUidLabel: "UID Bybit",
      submitButton: "Kirim & ajukan",
      binanceHelp1: "Buka aplikasi Binance → Profil → ID",
      binanceHelp2: "Salin angka UID saja.",
      bybitHelp1: "Buka aplikasi Bybit → Profil → UID",
      bybitHelp2: "Salin angka UID saja.",
      notice: {
        sameDayApproval:
          "Pengajuan UID biasanya disetujui pada hari yang sama.",
        premium30Days:
          "Setelah UID Anda disetujui, akun Anda mendapatkan akses Premium selama 30 hari.",
        monthlyTradingRequired:
          "Aktivitas trading bulanan diperlukan untuk mempertahankan Premium.",
        returnToBasic:
          "Jika aktivitas trading bulanan tidak terkonfirmasi, akun Anda akan kembali ke Basic.",
      },
    },
    step3: {
      title: "Manfaat Premium",
      benefitNews: {
        title: "Hot in Korea & Berita Pasar Korea",
        description:
          "Dapatkan akses penuh ke ringkasan utama Hot in Korea, berita saham Korea, dan keterbukaan perusahaan.",
      },
      benefitMarketData: {
        title: "Data pasar Korea",
        description: "Akses data pasar Korea yang dibuat untuk investor global.",
      },
      benefitComingSoon: {
        title: "Fitur Premium lainnya segera hadir",
        description:
          "Kami terus membangun lebih banyak alat Premium untuk investor pasar Korea.",
      },
    },
    bottom: {
      notice: {
        uidRequired:
          "Persetujuan UID diperlukan untuk mengaktifkan akses Premium. Anda akan diberi tahu melalui email dan dalam aplikasi setelah UID Anda disetujui.",
      },
    },
  },
  hi: {
    page: {
      title: "ट्रेडिंग शुरू करें और Premium पाएं",
      subtitle:
        "अपनी पसंद के एक्सचेंज पर खाता बनाएं, अपना UID कनेक्ट करें और Premium एक्सेस पाएं.",
    },
    step1: {
      title: "अपनी पसंद के एक्सचेंज पर खाता बनाएं",
      description: "एक एक्सचेंज चुनें और हमारे रेफरल लिंक से साइन अप करें.",
      commonTrust: {
        title: "भरोसेमंद और सुरक्षित",
        description:
          "दोनों एक्सचेंज वैश्विक स्तर पर भरोसेमंद और सुरक्षित माने जाते हैं.",
      },
      commonDeposit: {
        title: "डिपॉज़िट करें और ट्रेडिंग शुरू करें",
        description: "फंड डिपॉज़िट करें और तुरंत ट्रेडिंग शुरू करें.",
      },
      binanceButton: "Binance पर साइन अप करें",
      bybitButton: "Bybit पर साइन अप करें",
      notice: {
        supportedRegions:
          "केवल समर्थित क्षेत्रों के योग्य उपयोगकर्ता ही हमारे लिंक से साइन अप कर सकते हैं.",
        newAccountRequired:
          "Premium एक्सेस पाने के लिए, आपको हमारे रेफरल लिंक से एक नया खाता बनाना होगा. मौजूदा खाते Premium एक्सेस के लिए योग्य नहीं हैं.",
      },
    },
    step2: {
      title: "अपना UID कनेक्ट करें और Premium के लिए आवेदन करें",
      description: "एक्सचेंज से अपना UID दर्ज करें और अपना आवेदन जमा करें.",
      binanceUidLabel: "Binance UID",
      bybitUidLabel: "Bybit UID",
      submitButton: "जमा करें और आवेदन करें",
      binanceHelp1: "Binance ऐप खोलें → Profile → ID",
      binanceHelp2: "केवल UID नंबर कॉपी करें.",
      bybitHelp1: "Bybit ऐप खोलें → Profile → UID",
      bybitHelp2: "केवल UID नंबर कॉपी करें.",
      notice: {
        sameDayApproval:
          "UID आवेदन आमतौर पर उसी दिन स्वीकृत हो जाते हैं.",
        premium30Days:
          "आपका UID स्वीकृत होने के बाद, आपके खाते को 30 दिनों का Premium एक्सेस मिलेगा.",
        monthlyTradingRequired:
          "Premium बनाए रखने के लिए मासिक ट्रेडिंग गतिविधि आवश्यक है.",
        returnToBasic:
          "यदि मासिक ट्रेडिंग गतिविधि की पुष्टि नहीं होती है, तो आपका खाता Basic पर वापस चला जाएगा.",
      },
    },
    step3: {
      title: "Premium लाभ",
      benefitNews: {
        title: "Hot in Korea और कोरियाई बाज़ार समाचार",
        description:
          "Hot in Korea समाचार, कोरियाई स्टॉक समाचार और डिस्क्लोज़र के मुख्य सारांशों तक पूरा एक्सेस पाएं.",
      },
      benefitMarketData: {
        title: "कोरियाई बाज़ार डेटा",
        description:
          "वैश्विक निवेशकों के लिए बनाया गया कोरियाई बाज़ार डेटा एक्सेस करें.",
      },
      benefitComingSoon: {
        title: "और Premium सुविधाएं जल्द आ रही हैं",
        description:
          "हम कोरियाई बाज़ार निवेशकों के लिए और Premium टूल लगातार बना रहे हैं.",
      },
    },
    bottom: {
      notice: {
        uidRequired:
          "Premium एक्सेस सक्रिय करने के लिए UID स्वीकृति आवश्यक है. UID स्वीकृत होने पर आपको ईमेल और ऐप में सूचना मिलेगी.",
      },
    },
  },
  ru: {
    page: {
      title: "Начните торговать и получите Premium",
      subtitle:
        "Создайте аккаунт на выбранной бирже, подключите UID и получите доступ Premium.",
    },
    step1: {
      title: "Создайте аккаунт на выбранной бирже",
      description: "Выберите биржу и зарегистрируйтесь по нашей реферальной ссылке.",
      commonTrust: {
        title: "Надежно и безопасно",
        description:
          "Обе биржи считаются надежными и безопасными по всему миру.",
      },
      commonDeposit: {
        title: "Пополните счет и начните торговать",
        description: "Пополните счет и начните торговать сразу.",
      },
      binanceButton: "Зарегистрироваться на Binance",
      bybitButton: "Зарегистрироваться на Bybit",
      notice: {
        supportedRegions:
          "Только пользователи из поддерживаемых регионов могут зарегистрироваться по нашим ссылкам.",
        newAccountRequired:
          "Чтобы получить доступ Premium, необходимо создать новый аккаунт по нашей реферальной ссылке. Существующие аккаунты не подходят для доступа Premium.",
      },
    },
    step2: {
      title: "Подключите UID и подайте заявку на Premium",
      description: "Введите UID с биржи и отправьте заявку.",
      binanceUidLabel: "UID Binance",
      bybitUidLabel: "UID Bybit",
      submitButton: "Отправить заявку",
      binanceHelp1: "Откройте приложение Binance → Профиль → ID",
      binanceHelp2: "Скопируйте только цифры UID.",
      bybitHelp1: "Откройте приложение Bybit → Профиль → UID",
      bybitHelp2: "Скопируйте только цифры UID.",
      notice: {
        sameDayApproval:
          "Заявки по UID обычно одобряются в тот же день.",
        premium30Days:
          "После одобрения UID ваш аккаунт получит доступ Premium на 30 дней.",
        monthlyTradingRequired:
          "Для сохранения Premium требуется ежемесячная торговая активность.",
        returnToBasic:
          "Если ежемесячная торговая активность не подтверждена, ваш аккаунт вернется на Basic.",
      },
    },
    step3: {
      title: "Преимущества Premium",
      benefitNews: {
        title: "Hot in Korea и новости корейского рынка",
        description:
          "Получите полный доступ к ключевым сводкам Hot in Korea, новостям корейских акций и раскрытиям компаний.",
      },
      benefitMarketData: {
        title: "Данные корейского рынка",
        description:
          "Получайте доступ к данным корейского рынка, созданным для глобальных инвесторов.",
      },
      benefitComingSoon: {
        title: "Скоро появятся новые функции Premium",
        description:
          "Мы продолжаем создавать новые Premium-инструменты для инвесторов корейского рынка.",
      },
    },
    bottom: {
      notice: {
        uidRequired:
          "Для активации доступа Premium требуется одобрение UID. Вы получите уведомление по email и в приложении после одобрения UID.",
      },
    },
  },
  uk: {
    page: {
      title: "Почніть торгувати й отримайте Premium",
      subtitle:
        "Створіть акаунт на вибраній біржі, підключіть UID і отримайте доступ Premium.",
    },
    step1: {
      title: "Створіть акаунт на вибраній біржі",
      description: "Виберіть біржу та зареєструйтеся за нашим реферальним посиланням.",
      commonTrust: {
        title: "Надійно та безпечно",
        description:
          "Обидві біржі вважаються надійними та безпечними в усьому світі.",
      },
      commonDeposit: {
        title: "Поповніть рахунок і почніть торгувати",
        description: "Поповніть рахунок і почніть торгувати одразу.",
      },
      binanceButton: "Зареєструватися на Binance",
      bybitButton: "Зареєструватися на Bybit",
      notice: {
        supportedRegions:
          "Лише користувачі з підтримуваних регіонів можуть зареєструватися через наші посилання.",
        newAccountRequired:
          "Щоб отримати доступ Premium, потрібно створити новий акаунт через наше реферальне посилання. Наявні акаунти не підходять для доступу Premium.",
      },
    },
    step2: {
      title: "Підключіть UID і подайте заявку на Premium",
      description: "Введіть свій UID з біржі та надішліть заявку.",
      binanceUidLabel: "UID Binance",
      bybitUidLabel: "UID Bybit",
      submitButton: "Надіслати заявку",
      binanceHelp1: "Відкрийте застосунок Binance → Профіль → ID",
      binanceHelp2: "Скопіюйте лише цифри UID.",
      bybitHelp1: "Відкрийте застосунок Bybit → Профіль → UID",
      bybitHelp2: "Скопіюйте лише цифри UID.",
      notice: {
        sameDayApproval:
          "Заявки UID зазвичай схвалюються того ж дня.",
        premium30Days:
          "Після схвалення UID ваш акаунт отримає 30 днів доступу Premium.",
        monthlyTradingRequired:
          "Для збереження Premium потрібна щомісячна торгова активність.",
        returnToBasic:
          "Якщо щомісячну торгову активність не підтверджено, ваш акаунт повернеться до Basic.",
      },
    },
    step3: {
      title: "Переваги Premium",
      benefitNews: {
        title: "Hot in Korea і новини корейського ринку",
        description:
          "Отримайте повний доступ до ключових підсумків Hot in Korea, новин корейських акцій і корпоративних розкриттів.",
      },
      benefitMarketData: {
        title: "Дані корейського ринку",
        description:
          "Отримуйте доступ до даних корейського ринку, створених для глобальних інвесторів.",
      },
      benefitComingSoon: {
        title: "Більше Premium-функцій незабаром",
        description:
          "Ми постійно створюємо більше Premium-інструментів для інвесторів корейського ринку.",
      },
    },
    bottom: {
      notice: {
        uidRequired:
          "Для активації доступу Premium потрібне схвалення UID. Ви отримаєте сповіщення електронною поштою та в застосунку після схвалення UID.",
      },
    },
  },
  "zh-TW": {
    page: {
      title: "開始交易並取得 Premium",
      subtitle:
        "在您偏好的交易所建立帳戶，連結 UID，並取得 Premium 存取權。",
    },
    step1: {
      title: "在您偏好的交易所建立帳戶",
      description: "選擇交易所，並使用我們的推薦連結註冊。",
      commonTrust: {
        title: "值得信賴且安全",
        description: "這兩家交易所在全球皆被視為值得信賴且安全。",
      },
      commonDeposit: {
        title: "入金並開始交易",
        description: "完成入金後即可開始交易。",
      },
      binanceButton: "在 Binance 註冊",
      bybitButton: "在 Bybit 註冊",
      notice: {
        supportedRegions:
          "只有受支援地區的合資格使用者可以透過我們的連結註冊。",
        newAccountRequired:
          "若要取得 Premium 存取權，您必須透過我們的推薦連結建立新帳戶。既有帳戶不符合 Premium 存取資格。",
      },
    },
    step2: {
      title: "連結您的 UID 並申請 Premium",
      description: "輸入您在交易所的 UID，並提交申請。",
      binanceUidLabel: "Binance UID",
      bybitUidLabel: "Bybit UID",
      submitButton: "提交並申請",
      binanceHelp1: "開啟 Binance App → 個人資料 → ID",
      binanceHelp2: "僅複製 UID 數字。",
      bybitHelp1: "開啟 Bybit App → 個人資料 → UID",
      bybitHelp2: "僅複製 UID 數字。",
      notice: {
        sameDayApproval: "UID 申請通常會在同日完成核准。",
        premium30Days: "UID 核准後，您的帳戶將獲得 30 天 Premium 存取權。",
        monthlyTradingRequired: "若要維持 Premium，需要每月有交易活動。",
        returnToBasic: "如果未確認每月交易活動，您的帳戶將回到 Basic。",
      },
    },
    step3: {
      title: "Premium 權益",
      benefitNews: {
        title: "Hot in Korea 與韓國市場新聞",
        description:
          "完整存取 Hot in Korea 新聞、韓國股票新聞與公司公告的重點摘要。",
      },
      benefitMarketData: {
        title: "韓國市場資料",
        description: "存取專為全球投資人打造的韓國市場資料。",
      },
      benefitComingSoon: {
        title: "更多 Premium 功能即將推出",
        description: "我們正持續為韓國市場投資人打造更多 Premium 工具。",
      },
    },
    bottom: {
      notice: {
        uidRequired:
          "啟用 Premium 存取權需要 UID 核准。UID 核准後，您將透過電子郵件和站內通知收到通知。",
      },
    },
  },
};

/** Guide page body copy for the active locale, falling back to English. */
export function getGuideContent(locale: SupportedLocale): GuideContent {
  return GUIDE_CONTENT[locale] ?? GUIDE_CONTENT.en!;
}
