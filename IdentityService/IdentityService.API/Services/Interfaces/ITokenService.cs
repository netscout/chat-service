using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace IdentityService.API.Services.Interfaces
{
    public interface ITokenService
    {
        DateTime GenerateToken(
            long id,
            string email,
            string name,
            List<Claim> roleClaims,
            DateTime? expires = null);
    }
}
