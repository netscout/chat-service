using System.ComponentModel.DataAnnotations;

namespace IdentityService.API.Models.Identity.Dtos
{
    public class LoginDto
    {
        [Required(ErrorMessage = "이메일은 필수입니다.")]
        [EmailAddress]
        public string Email { get; set; }

        [Required(ErrorMessage = "패스워드는 필수입니다.")]
        [StringLength(20, MinimumLength = 8)]
        [RegularExpression(@"^(?=.*[a-zA-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{8,}$")]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [Required(ErrorMessage = "역할은 필수입니다.")]
        [StringLength(20, MinimumLength = 4)]
        public string Role { get; set; }
    }
}
