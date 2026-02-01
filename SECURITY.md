# 🔒 GUÍA DE SEGURIDAD - Simulador Táctico

## Resumen de Medidas Implementadas

Este documento describe las medidas de seguridad implementadas en el proyecto.

---

## 1. Protección de Headers HTTP (Helmet)

### Headers configurados:
- **Content-Security-Policy (CSP)**: Controla qué recursos puede cargar el navegador
- **X-Frame-Options**: Previene clickjacking (DENY)
- **X-Content-Type-Options**: Previene MIME sniffing (nosniff)
- **X-XSS-Protection**: Activa filtro XSS del navegador
- **Strict-Transport-Security**: Fuerza HTTPS en producción
- **Referrer-Policy**: Controla información enviada en referer

---

## 2. Rate Limiting

### Límites configurados:

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| API General | 100 requests | 15 minutos |
| Login | 5 intentos | 15 minutos |
| Registro | 3 cuentas | 1 hora |
| Pagos | 10 operaciones | 1 hora |

---

## 3. Validación de Inputs

### Política de contraseñas:
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial (!@#$%^&*(),.?":{}|<>)

### Validaciones de email:
- Formato válido
- Máximo 255 caracteres
- Normalizado (lowercase)

---

## 4. Protección contra Ataques

### SQL Injection
- ✅ Parámetros preparados en todas las queries
- ✅ Validación de tipos de datos
- ✅ Escape de caracteres especiales

### XSS (Cross-Site Scripting)
- ✅ Sanitización de inputs en servidor
- ✅ Helmet XSS Filter
- ✅ Content Security Policy
- ✅ SecurityUtils.js para frontend

### CSRF (Cross-Site Request Forgery)
- ✅ CORS restrictivo
- ✅ Validación de Origin
- ✅ SameSite en producción

### Timing Attacks
- ✅ Tiempo constante en verificación de credenciales
- ✅ fakePasswordCheck() cuando usuario no existe

---

## 5. Configuración Segura

### Variables de Entorno
```bash
# NUNCA commitear .env
# Usar .env.example como referencia

# Generar JWT_SECRET seguro:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### .gitignore actualizado
```
.env
.env.local
.env.production
*.pem
*.key
secrets/
```

---

## 6. CORS

### Desarrollo
- Permite localhost:3000, 5500, 8080

### Producción
- Solo FRONTEND_URL configurado
- Bloquea origins no autorizados

---

## 7. Logging de Seguridad

Se detectan y registran:
- Intentos de rate limit excedido
- Patrones sospechosos (SQL injection, XSS)
- Validaciones fallidas

---

## 8. Checklist para Producción

- [ ] Cambiar JWT_SECRET por uno seguro (64+ caracteres)
- [ ] Configurar FRONTEND_URL correctamente
- [ ] Activar HTTPS
- [ ] Configurar usuario de BD con permisos mínimos
- [ ] Revisar y ajustar rate limits
- [ ] Configurar HSTS
- [ ] Ejecutar `npm audit fix`
- [ ] Remover logs de desarrollo

---

## 9. Dependencias de Seguridad

```json
{
  "helmet": "^7.x",
  "express-rate-limit": "^7.x",
  "express-validator": "^7.x",
  "hpp": "^0.x",
  "bcrypt": "^5.x"
}
```

---

## 10. Actualizaciones Futuras Recomendadas

1. **Implementar 2FA** para cuentas premium
2. **Refresh tokens** para mejor gestión de sesiones
3. **Auditoría de dependencias** periódica (`npm audit`)
4. **Logs centralizados** con herramienta como Winston
5. **Encriptación de datos** sensibles en reposo

---

## Contacto de Seguridad

Si encuentras una vulnerabilidad, reporta de forma responsable.
