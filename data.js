/* data.js - fake hierarchical dataset with details for each leaf.
   Each leaf may contain: level, losses (direct/indirect), incidents[], covered, totalRisks, news[], drivers[], ai.
*/

const riskData = {
  "name": "Операционные риски",
  "children": [
    {
      "name": "Законы",
      "children": [
        {
          "name": "Правовые риски",
          "level": "Средний",
          "losses": { "direct": 34000, "indirect": 20000 },
          "incidents": [{"title":"Дело по контракту","companyCount":1,"loss":20000}],
          "covered": 8,
          "totalRisks": 12,
          "news": ["Изменение в трактовке закона X"],
          "drivers": ["регуляторная нестабильность","#compliance"],
          "ai": "Юридическая практика требует обновления шаблонов контрактов и контроля исполнения."
        },
        {
          "name": "Регуляторные риски",
          "level": "Высокий",
          "losses": { "direct": 90000, "indirect": 90000 },
          "incidents": [{"title":"Предписание регулятора","companyCount":1,"loss":90000}],
          "covered": 2,
          "totalRisks": 5,
          "news": ["Новая методика расчёта штрафов"],
          "drivers": ["жёсткая позиция регулятора","#audit"],
          "ai": "Высокая вероятность штрафов без корректировок процессов; требуется оперативное действие."
        },
        {
          "name": "Риски информационной безопасности",
          "level": "Очень высокий",
          "losses": { "direct": 200000, "indirect": 150000 },
          "incidents": [{"title":"Взлом CRM","companyCount":2,"loss":120000},{"title":"Слив данных","companyCount":3,"loss":230000}],
          "covered": 4,
          "totalRisks": 6,
          "news": ["Утечка клиентских данных в СМИ"],
          "drivers": ["уязвимости ПО","#infosec","#data-breach"],
          "ai": "Срочно: усилить контроль доступа, патч-менеджмент и мониторинг — высокий риск утечек."
        }
      ]
    },
    {
      "name": "ИТ",
      "children": [
        {
          "name": "Технологические риски",
          "level": "Высокий",
          "losses": { "direct": 120000, "indirect": 90000 },
          "incidents": [{"title":"Падение сервиса","companyCount":4,"loss":210000}],
          "covered": 6,
          "totalRisks": 10,
          "news": ["Обновление платформы провалилось"],
          "drivers": ["устаревшая инфраструктура","#legacy"],
          "ai": "Необходимо план модернизации, чтобы снизить длительные простой и потери."
        }
      ]
    },
    {
      "name": "Клиенты",
      "children": [
        {
          "name": "Риски внешнего мошенничества",
          "level": "Средний",
          "losses": { "direct": 40000, "indirect": 30000 },
          "incidents": [{"title":"Фрод с картами","companyCount":5,"loss":70000}],
          "covered": 10,
          "totalRisks": 14,
          "news": ["Случаи фрод-атаки в регионе"],
          "drivers": ["социальная инженерия","#fraud"],
          "ai": "Усиление детекции и ограничение сумм транзакций поможет снизить потери."
        },
        {
          "name": "Риски клиентов",
          "level": "Низкий",
          "losses": { "direct": 10000, "indirect": 10000 },
          "incidents": [{"title":"Претензии клиентов","companyCount":2,"loss":20000}],
          "covered": 14,
          "totalRisks": 16,
          "news": ["Рост жалоб на качество"],
          "drivers": ["снижение лояльности","#feedback"],
          "ai": "Риск под контролем при поддержке качества."
        }
      ]
    },

    {
      "name": "Партнёры",
      "children": [
        {"name":"Риски контрагентов","level":"Средний","losses":{"direct":50000,"indirect":40000},"incidents":[{"title":"Банкротство партнёра","companyCount":1,"loss":90000}],"covered":3,"totalRisks":7,"news":["Проблемы в цепочке поставок"],"drivers":["финансовая нестабильность","#supplier-risk"],"ai":"Диверсифицировать поставщиков."},
        {"name":"Риски цепочки поставок","level":"Средний","losses":{"direct":60000,"indirect":60000},"incidents":[{"title":"Задержки поставок","companyCount":3,"loss":120000}],"covered":2,"totalRisks":6,"news":["Логистические сбои"],"drivers":["зависимость от узких поставщиков","#logistics"],"ai":"Рассмотреть складские резервы и альтернативных поставщиков."},
        {"name":"Товарные риски","level":"Низкий","losses":{"direct":5000,"indirect":10000},"incidents":[{"title":"Повреждение товара","companyCount":1,"loss":15000}],"covered":5,"totalRisks":5,"news":["Изменения спроса на товар A"],"drivers":["качество","#inventory"],"ai":"Низкий риск; контролировать качество."}
      ]
    },

    {
      "name": "Новости",
      "children": [
        {"name":"Репутационные риски","level":"Средний","losses":{"direct":60000,"indirect":40000},"incidents":[{"title":"Негатив в СМИ","companyCount":1,"loss":100000}],"covered":2,"totalRisks":4,"news":["Скандал в соцсетях"],"drivers":["публичность","#reputation"],"ai":"Мониторинг медиа и PR-меры снизят эффект."}
      ]
    },

    {
      "name": "Процессы",
      "children": [
        {"name":"Процессные риски","level":"Средний","losses":{"direct":50000,"indirect":30000},"incidents":[{"title":"Ошибка оператора","companyCount":3,"loss":80000}],"covered":12,"totalRisks":18,"news":["Автоматизация процессов"],"drivers":["человеческий фактор","#ops"],"ai":"Оптимизация и обучение персонала снизят частоту инцидентов."}
      ]
    },

    {
      "name": "Сотрудники",
      "children": [
        {"name":"Риски внутреннего мошенничества","level":"Высокий","losses":{"direct":100000,"indirect":50000},"incidents":[{"title":"Внутренний фрод","companyCount":1,"loss":150000}],"covered":1,"totalRisks":4,"news":["Задержки выплат"],"drivers":["корпоративная культура","#insider"],"ai":"Проверки доступа и контроль транзакций необходимы."},
        {"name":"Риски персонала","level":"Низкий","losses":{"direct":15000,"indirect":15000},"incidents":[{"title":"Увольнения","companyCount":2,"loss":30000}],"covered":9,"totalRisks":9,"news":["Переток сотрудников"],"drivers":["текучка","#hr"],"ai":"HR-метрики показывают стабильность."}
      ]
    },

    {
      "name": "Внешние факторы",
      "children": [
        {"name":"Природные риски","level":"Низкий","losses":{"direct":30000,"indirect":20000},"incidents":[{"title":"Наводнение","companyCount":1,"loss":50000}],"covered":2,"totalRisks":3,"news":["Наводнение в регионе"],"drivers":["климатические явления","#natural"],"ai":"Резервирование инфраструктуры полезно."},
        {"name":"Техногенные риски","level":"Средний","losses":{"direct":70000,"indirect":40000},"incidents":[{"title":"Авария на объекте","companyCount":1,"loss":110000}],"covered":2,"totalRisks":4,"news":["Инцидент на заводе"],"drivers":["износ оборудования","#tech"],"ai":"Профилактика оборудования — приоритет."},
        {"name":"Физическая безопасность","level":"Низкий","losses":{"direct":8000,"indirect":12000},"incidents":[{"title":"Кража","companyCount":1,"loss":20000}],"covered":6,"totalRisks":6,"news":["Мелкие кражи"],"drivers":["нехватка охраны","#physical"],"ai":"Укрепить охрану в точках риска."}
      ]
    },

    {
      "name": "Проекты",
      "children": [
        {"name":"Проектные риски","level":"Средний","losses":{"direct":60000,"indirect":35000},"incidents":[{"title":"Срыв запуска","companyCount":1,"loss":95000}],"covered":3,"totalRisks":7,"news":["Задержки по проекту X"],"drivers":["недостаточное планирование","#project"],"ai":"Пересмотр графика и резервы уменьшат вероятность провала."}
      ]
    }
  ]
};
