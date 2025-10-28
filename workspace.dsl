workspace "Konnaxion" "Generated from manifest (deep)" {
  model {
    person "User" as p_User
    softwareSystem "Konnaxion" as sys_Konnaxion {
      container "Api" as c_Api "Django/DRF" "35 models, 1 Celery tasks"
      container "Worker" as c_Worker "Celery" ""
      container "Realtime" as c_Realtime "Django Channels" ""
      container "WebApp" as c_WebApp "Next.js" ""
      containerDb "appdb" as ds_appdb "PostgreSQL" "Persistent data"
      container "celery" as msg_celery "Redis/RabbitMQ" "Queue"
    }
    c_WebApp -> c_Api "GET"
    c_Api -> ds_appdb "read/write"
    c_Worker -> ds_appdb "read/write"
    c_Realtime -> ds_appdb "read/write"
  }
  views {
    systemContext sys_Konnaxion "System Context" { include * autoLayout }
    container sys_Konnaxion "Containers" { include * autoLayout }
    styles { element "Person" { shape Person } }
  }
}