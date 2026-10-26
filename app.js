
const teacherLoginPanel = document.getElementById("teacherLogin");
const teacherLoginButton = document.getElementById("teacherLoginButton");
const teacherLoginMessage = document.getElementById("teacherLoginMessage");

const teacherWorkspacePanels = [...teacherView.children].filter(
  (element) => element !== teacherLoginPanel
);

teacherWorkspacePanels.forEach((panel) => panel.classList.add("hidden"));

teacherLoginButton.addEventListener("click", async () => {
  const email = document.getElementById("teacherEmail").value.trim();
  const password = document.getElementById("teacherPassword").value;

  if (!email || !password) {
    teacherLoginMessage.textContent = "Enter your teacher email and password.";
    return;
  }

  if (!supabaseClient) {
    teacherLoginMessage.textContent = "Supabase configuration is missing.";
    return;
  }

  teacherLoginButton.disabled = true;
  teacherLoginMessage.textContent = "Signing in...";

  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const { data: isTeacher, error: roleError } =
      await supabaseClient.rpc("is_frogquiz_teacher");

    if (roleError) throw roleError;

    if (isTeacher !== true) {
      await supabaseClient.auth.signOut();
      throw new Error("This account is not authorized as a teacher.");
    }

    teacherLoginPanel.classList.add("hidden");
    teacherWorkspacePanels.forEach((panel) => panel.classList.remove("hidden"));

    document.getElementById("examJson").value = JSON.stringify(exam, null, 2);
    renderResults();
    teacherLoginMessage.textContent = "";
  } catch (error) {
    teacherLoginMessage.textContent =
      error.message || "Sign-in failed. Please try again.";
  } finally {
    teacherLoginButton.disabled = false;
  }
});

const saveClassButton = document.getElementById("saveClass");

if (saveClassButton) {
  saveClassButton.addEventListener("click", async () => {
    const className = document.getElementById("className")?.value.trim();
    const classCode = document.getElementById("classCode")?.value.trim();
    const message = document.getElementById("classMessage");

    if (!message) {
      alert("The class message element is missing from index.html.");
      return;
    }

    if (!className || !classCode) {
      message.textContent = "Enter both the class name and class code.";
      return;
    }

    if (!supabaseClient) {
      message.textContent = "Supabase configuration is missing.";
      return;
    }

    saveClassButton.disabled = true;
    message.textContent = "Saving class...";

    try {
      const { data, error } = await supabaseClient.rpc(
        "frogquiz_create_class",
        {
          p_class_name: className,
          p_class_code: classCode
        }
      );

      if (error) throw error;

      message.textContent = `Class saved! Code: ${data.class_code}`;
    } catch (error) {
      console.error("Save class failed:", error);
      message.textContent = "Could not save class: " + error.message;
    } finally {
      saveClassButton.disabled = false;
    }
  });
} else {
  console.error("FrogQuiz: saveClass button not found.");
}
